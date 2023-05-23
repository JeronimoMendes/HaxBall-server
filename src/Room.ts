import Player from './Player'
import Kick from './Kick';
import CommandFactory from './commands/CommandFactory';
import { loadMap, drawPlayersOnTeams, Log, writeCSV } from './utils'
import { colors } from './style'

class Room {
    state: RoomState;
    haxRoom: RoomObject;
    players: Player[] = [];
    previousKicker: Player | null = null;
    kicker: Player | null = null;
    winningTeam: Player[] = [];
    gameKicks: Kick[] = [];

    constructor(haxRoom: RoomObject) {
        this.haxRoom = haxRoom;
        this.state = new RoomStateWaiting(this);

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
            this.players = this.players.filter((player) => player.id != oldPlayer.id);
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
            const player = this.getPlayerById(haxPlayer.id);
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

                const player = this.getPlayerById(haxPlayer.id);
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
    }

    onPlayerJoin(player: Player): void {
        Log.info(player.name + " just joined!");
        this.state.onPlayerJoin();
    }

    onPlayerLeave(player: Player): void {
        Log.info(player.name + " just left!");
        player.saveStats();
        this.state.onPlayerLeave(player);
        this.players = this.players.filter((player) => player.id != player.id);
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
        this.state.endGame();
        this.gameKicks = [];
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
        this.state.endGame();

        // reset game kicks
        this.gameKicks = [];
    }

    shuffleTeams(): void {
        // Remove players that are not in the room anymore from the winning team
        this.winningTeam = this.winningTeam.filter((player) => this.players.includes(player));

        drawPlayersOnTeams(this.haxRoom, this.players, this.winningTeam);
    }

    getPlayerById(id: number): Player | undefined {
        return this.players.find((player) => player.id == id);
    }

    gameKicksToCSV(): string {
        let csv = "";
        this.gameKicks.forEach((kick) => {
            csv += kick.toCSV() + "\n";
        });
        return csv;
    }
};

abstract class RoomState {
    protected room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    abstract onPlayerJoin(): void;
    abstract endGame(): void;

    onPlayerLeave(player: Player): void {
        const team = player.team;

        // pick a random waiting player to replace the leaving player if he was playing
        if (team != 0) {
            const waitingPlayers = this.room.players.filter((player) => player.team == 0);
            if (waitingPlayers.length > 0) {
                const randomWaitingPlayer = waitingPlayers[Math.floor(Math.random() * waitingPlayers.length)];
                randomWaitingPlayer.team = team;
            }
        }
    };
}

class RoomStateWaiting extends RoomState {
    constructor(room: Room) {
        Log.info("Waiting for players...")
        super(room);
        const map : string = loadMap('futsal_waiting')
        this.room.haxRoom.setCustomStadium(map);
    }

    onPlayerJoin(): void {
        // if there are more than 1 player, change to 1v1
        if (this.room.players.length > 1) {
            this.room.endGame();
            this.room.state = new RoomState1v1(this.room);
        } else {
            this.room.startGame();
        }
    }

    onPlayerLeave(player: Player): void {
    }

    endGame(): void {
        const csv = this.room.gameKicksToCSV();
        writeCSV(csv, "xGtest");
    }
}

class RoomState1v1 extends RoomState {
    constructor(room: Room) {
        Log.info("1v1 started!")
        super(room);
        // initialize with 1v1 stadium
        const map : string = loadMap('futsal_1v1')
        this.room.haxRoom.setCustomStadium(map);
        this.room.startGame();
    }
    
    onPlayerJoin(): void {
        // if there are more than 3 player, change to 2v2
        if (this.room.haxRoom.getPlayerList().length > 3) {
            this.room.endGame();
            this.room.state = new RoomState2v2(this.room);
        }
    }

    onPlayerLeave(player: Player): void {
        // if there are less than 2 player, change to waiting
        if (this.room.haxRoom.getPlayerList().length < 2) {
            this.room.endGame();
            this.room.state = new RoomStateWaiting(this.room);
        } else {
            super.onPlayerLeave(player);
        }     
    }

    endGame(): void {
        // store game kicks in 1v1 csv file
        const csv = this.room.gameKicksToCSV();
        writeCSV(csv, "xG1v1");
    }
}

class RoomState2v2 extends RoomState {
    constructor(room: Room) {
        Log.info("2v2 started!")
        super(room);
        this.room.startGame();
    }

    onPlayerJoin(): void {
        // if there are more than 7 player, change to 3v3
        if (this.room.haxRoom.getPlayerList().length > 5) {
            this.room.state = new RoomState3v3(this.room);
        }
    }

    onPlayerLeave(player: Player): void {
        // if there are less than 4 player, change to 1v1
        if (this.room.haxRoom.getPlayerList().length < 4) {
            this.room.endGame();
            this.room.state = new RoomState1v1(this.room);
        } else {
            super.onPlayerLeave(player);
        }  
    }
    
    endGame(): void {
        const csv = this.room.gameKicksToCSV();
        writeCSV(csv, "xG2v2");
    }
}

class RoomState3v3 extends RoomState {
    constructor(room: Room) {
        Log.info("3v3 started!")
        super(room);
        // initialize with 3v3 stadium
        this.room.haxRoom.setCustomStadium(loadMap('futsal_3v3'));
        this.room.startGame();
    }

    onPlayerJoin(): void {
        // if there are more than 11 player, change to 4v4
        if (this.room.haxRoom.getPlayerList().length > 7) {
            this.room.state = new RoomState4v4(this.room);
        }
    }

    onPlayerLeave(player: Player): void {
        // if there are less than 6 player, change to 2v2
        if (this.room.haxRoom.getPlayerList().length < 6) {
            this.room.endGame();
            this.room.state = new RoomState2v2(this.room);
        } else {
            super.onPlayerLeave(player);
        }  
    } 

    endGame(): void {
        const csv = this.room.gameKicksToCSV();
        writeCSV(csv, "xG3v3");
    }
}

class RoomState4v4 extends RoomState {
    constructor(room: Room) {
        Log.info("4v4 started!")
        super(room);
        // initialize with 4v4 stadium
        this.room.haxRoom.setCustomStadium(loadMap('futsal_4v4'));
        this.room.startGame();
    }

    onPlayerJoin(): void {
    }

    onPlayerLeave(player: Player): void {
        // if there are less than 8 player, change to 3v3
        if (this.room.haxRoom.getPlayerList().length < 8) {
            this.room.endGame();
            this.room.state = new RoomState3v3(this.room);
        } else {
            super.onPlayerLeave(player);
        }  
    }

    endGame(): void {
        const csv = this.room.gameKicksToCSV();
        writeCSV(csv, "xG4v4");
    }
}

export default Room;