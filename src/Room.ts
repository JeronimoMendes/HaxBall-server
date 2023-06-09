import Player from './Player'
import Kick from './Kick';
import CommandFactory from './commands/CommandFactory';
import { Ballot } from './votes/ballot';
import { drawPlayersOnTeams, Log } from './utils'
import { colors, kits, Kit } from './style'
import RoomState from './states/RoomState';
import RoomStateWaiting from './states/RoomStateWaiting';
import { PitchDimensions } from "./states/stadiums";
import Game from './Game';
import { incrementAssists, incrementGoals, incrementOwnGoals, incrementWins, incrementLosses } from './db/db';


class Room {
    state: RoomState;
    haxRoom: RoomObject;
    players: Player[] = [];
    afkPlayers: Player[] = [];
    previousKicker: Player | null = null;
    kicker: Player | null = null;
    winningTeam: Player[] = [];
    gameKicks: Kick[] = [];
    currentGame: Game | null = null;
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
            newPlayer.sendMessage(
                "Welcome to the room!\nJoin our discord server on https://discord.gg/PSS5Pc7PYf\nType !help for a list of commands.",
                colors.red,
                "bold",
                2
            );
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
            const player = this.getPlayerByName(haxPlayer.name);
            if (!player) return false;

            if (message.startsWith("!")) {
                // strip the ! from the message
                message = message.substring(1);

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

            if (player.muted) {
                player.sendMessage(`${player.name}: ${message}`, colors.white, "normal", 1, false);
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
        this.players = this.players.filter((player) => player.name != leavingPlayer.name);
        this.afkPlayers = this.afkPlayers.filter((player) => player.name != leavingPlayer.name);
        this.state.onPlayerLeave(leavingPlayer);
    }

    onPlayerKick(player: Player): void {
        this.previousKicker = player == this.kicker ? null : this.kicker;
        this.kicker = player;
        if (this.currentGame == null) return;
        
        const newKick = new Kick(player, this, this.currentGame.id);
        this.gameKicks.push(newKick);
    }

    onTeamGoal(team: TeamID): void {
        if (this.kicker == null) return;

        if (this.kicker.team == team) {
            incrementGoals(this.kicker, this.state.toString());

            if (this.gameKicks.length > 0)
                this.gameKicks[this.gameKicks.length - 1].goal = true;
        } else {
            incrementOwnGoals(this.kicker, this.state.toString());
        }

        if (this.previousKicker != null) {
            if (this.previousKicker.team == team && this.previousKicker != this.kicker) {
                incrementAssists(this.previousKicker, this.state.toString());
            }
        }
    }

    onTeamVictory(winningTeam: number): void {
        this.winningTeam = this.players.filter((player) => player.team == winningTeam);
        const losingTeam: Player[] = this.players.filter((player) => player.team != winningTeam);

        this.winningTeam.forEach((player) => incrementGoals(player, this.state.toString()));
        losingTeam.forEach((player) => incrementOwnGoals(player, this.state.toString()));

        this.gameKicks = [];
        this.state.onTeamVictory();
    }

    onGameStart(): void {
        this.currentGame = new Game(this.state.toString());
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
        if (this.currentGame == null) return;
        this.haxRoom.stopGame();

        this.gameKicks = [];
        this.currentGame.endGame();
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