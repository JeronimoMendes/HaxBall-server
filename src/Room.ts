import Player from './Player'
import Kick from './Kick';
import CommandFactory from './commands/CommandFactory';
import { drawPlayersOnTeams, Log } from './utils'
import { colors } from './style'
import RoomState from './states/RoomState';
import RoomStateWaiting from './states/RoomStateWaiting';
import { v4 as uuidv4 } from 'uuid';


class Room {
    state: RoomState;
    haxRoom: RoomObject;
    players: Player[] = [];
    previousKicker: Player | null = null;
    kicker: Player | null = null;
    winningTeam: Player[] = [];
    gameKicks: Kick[] = [];
    currentGameID: string  = uuidv4();

    constructor(haxRoom: RoomObject) {
        this.haxRoom = haxRoom;
        this.state = new RoomStateWaiting(this, true);

        this.haxRoom.setScoreLimit(3);
        this.haxRoom.setTimeLimit(3);

        this.haxRoom.onPlayerJoin = (player: PlayerObject) => {
            let newPlayer = new Player(player, this.haxRoom);
            this.players.push(newPlayer);
            this.onPlayerJoin(newPlayer);
            newPlayer.sendMessage("Welcome to the room! Type !help for a list of commands.", colors.red, "bold", 2);
        }

        this.haxRoom.onPlayerLeave = (player: PlayerObject) => {
            let oldPlayer: Player = new Player(player, this.haxRoom);
            this.players = this.players.filter((player) => player.name != oldPlayer.name);
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

                const command = CommandFactory.createCommand(message, player);
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
        this.state.onPlayerJoin();
    }

    onPlayerLeave(player: Player): void {
        Log.info(player.name + " just left!");
        player.saveStats();
        this.state.onPlayerLeave(player);
    }

    onPlayerKick(player: Player): void {
        this.previousKicker = player == this.kicker ? null : this.kicker;
        this.kicker = player;
        const newKick = new Kick(player, this);
        this.gameKicks.push(newKick);
    }

    onTeamGoal(team: number): void {
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
        return this.players.find((player) => player.name == name);
    }

    gameKicksToCSV(): string {
        let csv = "";
        this.gameKicks.forEach((kick) => {
            csv += kick.toCSV() + "\n";
        });
        return csv;
    }
};

export default Room;