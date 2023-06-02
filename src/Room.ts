import Player from './Player'
import Kick from './Kick';
import CommandFactory from './commands/CommandFactory';
import { Ballot } from './votes/ballot';
import { drawPlayersOnTeams, Log } from './utils'
import { colors, kits, Kit } from './style'
import RoomState from './states/RoomState';
import RoomStateWaiting from './states/RoomStateWaiting';
import { v4 as uuidv4 } from 'uuid';
import { PitchDimensions } from "./states/stadiums";


class Room {
    state: RoomState;
    haxRoom: RoomObject;
    players: Player[] = [];
    afkPlayers: Player[] = [];
    previousKicker: Player | null = null;
    kicker: Player | null = null;
    winningTeam: Player[] = [];
    gameKicks: Kick[] = [];
    currentGameID: string  = uuidv4();
    currentBallot: Ballot | null = null;

    constructor(haxRoom: RoomObject) {
        this.haxRoom = haxRoom;
        this.state = new RoomStateWaiting(this, true);

        this.haxRoom.setScoreLimit(3);
        this.haxRoom.setTimeLimit(3);

        this.changeTeamColors(kits.redDefault, 1);
        this.changeTeamColors(kits.blueDefault, 2);

        this.haxRoom.onPlayerJoin = (player: PlayerObject) => {
            let newPlayer = new Player(player, this.haxRoom);
            this.players.push(newPlayer);
            this.onPlayerJoin(newPlayer);
            newPlayer.sendMessage("Welcome to the room! Type !help for a list of commands.", colors.red, "bold", 2);
        }

        this.haxRoom.onPlayerLeave = (player: PlayerObject) => {
            const oldPlayer = this.getPlayerByName(player.name);
            if (!oldPlayer) return;
            this.onPlayerLeave(oldPlayer);
        }

        this.haxRoom.onGameStop = () => {
            this.startGame();
        }

        this.haxRoom.onTeamVictory = (score) => {
            Log.info("Game ended! " + score.red + " : " + score.blue);

            const winningTeam = score.red > score.blue ? 1 : 2;
            const winningTeamName = winningTeam == 1 ? "Red" : "Blue";
            const msgColor = winningTeam == 1 ? colors.red : colors.blue;
            this.haxRoom.sendAnnouncement(winningTeamName + " won! " + + score.red + " : " + score.blue, undefined, msgColor, "bold", 2);
            this.onTeamVictory(winningTeam);
        }

        this.haxRoom.onRoomLink = (link) => {
            Log.info("Room link: " + link);
        }

        this.haxRoom.onPlayerBallKick = (haxPlayer) => {
            const player = this.getPlayerByName(haxPlayer.name);
            if (!player) return;

            this.onPlayerKick(player);
        }

        this.haxRoom.onTeamGoal = (team) => {
            const teamColor = (team == 1) ? colors.red : colors.blue;

            if (this.kicker == null) return;
            this.haxRoom.sendAnnouncement(this.kicker.name + " scored!", undefined, teamColor, "bold", 2);
            this.onTeamGoal(team);
        }

        this.haxRoom.onPlayerChat = (haxPlayer, message) => {
            if (message.startsWith("!")) {
                // strip the ! from the message
                message = message.substring(1);

                const player = this.getPlayerByName(haxPlayer.name);
                if (!player) return false;
                
                const commandName = message.split(" ")[0];
                const commandArgs = message.split(" ").slice(1);
                const command = CommandFactory.createCommand(commandName, commandArgs, player, this);
                if (command) {
                    command.execute();
                } else {
                    player.sendMessage("Unknown command!");
                }
                return false;
            }
            return true;
        }

        this.haxRoom.onGameStart = () => {
            this.onGameStart();
        }
    }

    onPlayerJoin(player: Player): void {
        Log.info(player.name + " just joined!");
        this.state.onPlayerJoin(player);
    }

    onPlayerLeave(leavingPlayer: Player): void {
        Log.info(leavingPlayer.name + " just left!");
        leavingPlayer.saveStats();
        this.players = this.players.filter((player) => player.name != leavingPlayer.name);
        this.afkPlayers = this.afkPlayers.filter((player) => player.name != leavingPlayer.name);
        this.state.onPlayerLeave(leavingPlayer);
    }

    onPlayerKick(player: Player): void {
        this.previousKicker = player == this.kicker ? null : this.kicker;
        this.kicker = player;
        const newKick = new Kick(player, this);
        this.gameKicks.push(newKick);
    }

    onTeamGoal(team: TeamID): void {
        if (this.kicker == null) return;

        if (this.kicker.team == team) {
            this.kicker.goals += 1;
            if (this.gameKicks.length > 0)
                this.gameKicks[this.gameKicks.length - 1].goal = true;
        } else {
            this.kicker.ownGoals += 1;
        }

        if (this.previousKicker != null) {
            if (this.previousKicker.team == team) {
                this.previousKicker.assists += 1;
            }
        }
    }

    onTeamVictory(winningTeam: number): void {
        this.winningTeam = this.players.filter((player) => player.team == winningTeam);
        const losingTeam: Player[] = this.players.filter((player) => player.team != winningTeam);

        this.winningTeam.forEach((player) => player.wins += 1);
        losingTeam.forEach((player) => player.losses += 1);

        this.state.saveGameKicks(this.gameKicksToCSV());
        this.gameKicks = [];

        this.state.onTeamVictory();
    }

    onGameStart(): void {
        this.currentGameID = uuidv4();
    }

    startGame(): void {
        Log.info("Starting game...")
        this.shuffleTeams();
        this.haxRoom.startGame();

        // pause the game to give players time to get ready
        this.haxRoom.pauseGame(true);
        // there's a small delay in-game when unpausing the game so there's no need 
        // to simulate a delay here
        this.haxRoom.pauseGame(false);
    }

    endGame(): void {
        Log.info("Ending game...")
        this.haxRoom.stopGame();
        this.state.saveGameKicks(this.gameKicksToCSV());

        // reset game kicks
        this.gameKicks = [];
    }

    shuffleTeams(): void {
        // Remove players that are not in the room anymore from the winning team
        this.winningTeam = this.winningTeam.filter((player) => this.players.includes(player));

        drawPlayersOnTeams(this.haxRoom, this.players, this.winningTeam);
    }

    getPlayerByName(name: string): Player | undefined {
        let player = this.players.find((player) => player.name == name);
        if (player) return player;

        return this.afkPlayers.find((player) => player.name == name);
    }

    gameKicksToCSV(): string {
        let csv = "";
        this.gameKicks.forEach((kick) => {
            csv += kick.toCSV() + "\n";
        });
        return csv;
    }

    sendAnnouncement(message: string, color?: number, style?: string, size?: number): void {
        this.haxRoom.sendAnnouncement(message, undefined, color, style, size);
    }

    setPlayerAFK(player: Player): void {
        this.players = this.players.filter((p) => p.name != player.name);
        this.afkPlayers.push(player);
        this.state.onPlayerLeave(player);
        player.afk = true;
    }

    setPlayerActive(player: Player): void {
        this.afkPlayers = this.afkPlayers.filter((p) => p.name != player.name);
        player.afk = false;
        this.players.push(player);
        this.state.onPlayerJoin(player);
    }

    changeTeamColors(kit: Kit, team: TeamID) {
        this.haxRoom.setTeamColors(team, kit.angle, kit.textColor, kit.colors);
    }

    getPitchDimensions(): PitchDimensions {
        return this.state.getPitchDimensions();
    }
};

export default Room;