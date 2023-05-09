import RoomObject from 'haxball.js'
import PlayerObject from 'haxball.js'
import Player from './Player'
import { loadMap, drawPlayersOnTeams } from './utils'

class Room {
    state: RoomState;
    haxRoom: RoomObject;

    constructor(haxRoom: RoomObject) {
        this.haxRoom = haxRoom;
        this.state = new RoomStateWaiting(this);

        this.haxRoom.setScoreLimit(3);
        this.haxRoom.setTimeLimit(3);

        this.haxRoom.onPlayerJoin = (player: PlayerObject) => {
            let newPlayer = new Player(player, this.haxRoom);
            this.onPlayerJoin(newPlayer);
        }

        this.haxRoom.onPlayerLeave = (player: PlayerObject) => {
            let oldPlayer: Player = new Player(player, this.haxRoom);
            this.onPlayerLeave(oldPlayer);
        }

        this.haxRoom.onGameStop = () => {
            this.startGame;
        }

        this.haxRoom.onTeamVictory = (score) => {
            console.log("Game ended! " + score.red + " : " + score.blue);

            const redWon = score.red > score.blue;
            const winningTeam = redWon ? "Red" : "Blue";
            const msgColor = redWon ? 0xFF0000 : 0x0000FF;
            this.haxRoom.sendAnnouncement(winningTeam + " won! " + + score.red + " : " + score.blue, undefined, msgColor, "bold", 2);
        }

        this.haxRoom.onRoomLink = (link) => {
            console.log("Room link: " + link);
        }
    }

    onPlayerJoin(player: Player): void {
        console.log(player.name + " just joined!");
        this.state.onPlayerJoin();
    }

    onPlayerLeave(player: Player): void {
        console.log(player.name + " just left!");
        this.state.onPlayerLeave();
    }

    startGame(): void {
        console.log("Starting game...")
        this.shuffleTeams();
        this.haxRoom.startGame();
    }

    shuffleTeams(): void {
        console.log("Shuffling teams...")
        const playersList = this.haxRoom.getPlayerList();
        drawPlayersOnTeams(this.haxRoom, playersList);
    }
}

abstract class RoomState {
    protected room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    abstract onPlayerJoin(): void;
    abstract onPlayerLeave(): void;
}

class RoomStateWaiting extends RoomState {
    constructor(room: Room) {
        console.log("Waiting for players...")
        super(room);
        const map : string = loadMap('futsal_1v1')
        this.room.haxRoom.setCustomStadium(map);
    }

    onPlayerJoin(): void {
        // if there are more than 1 player, change to 1v1
        if (this.room.haxRoom.getPlayerList().length > 1) {
            this.room.state = new RoomState1v1(this.room);
        }
    }

    onPlayerLeave(): void {
    }
}

class RoomState1v1 extends RoomState {
    constructor(room: Room) {
        console.log("1v1 started!")
        super(room);
        // initialize with 1v1 stadium
        const map : string = loadMap('futsal_1v1')
        this.room.haxRoom.setCustomStadium(map);
        this.room.startGame();
    }
    
    onPlayerJoin(): void {
        // if there are more than 3 player, change to 2v2
        if (this.room.haxRoom.getPlayerList().length > 3) {
            this.room.state = new RoomState2v2(this.room);
        }
    }

    onPlayerLeave(): void {
        // if there are less than 2 player, change to waiting
        if (this.room.haxRoom.getPlayerList().length < 2) {
            this.room.haxRoom.stopGame();
            this.room.state = new RoomStateWaiting(this.room);
        }
    }
}

class RoomState2v2 extends RoomState {
    constructor(room: Room) {
        console.log("2v2 started!")
        super(room);
        this.room.haxRoom.stopGame();
        // assign players to teams
        this.room.startGame();
    }

    onPlayerJoin(): void {
        // if there are more than 7 player, change to 3v3
        if (this.room.haxRoom.getPlayerList().length > 5) {
            this.room.state = new RoomState3v3(this.room);
        }
    }

    onPlayerLeave(): void {
        // if there are less than 4 player, change to 1v1
        if (this.room.haxRoom.getPlayerList().length < 4) {
            this.room.state = new RoomState1v1(this.room);
        }
    }
}

class RoomState3v3 extends RoomState {
    constructor(room: Room) {
        console.log("3v3 started!")
        super(room);
        // initialize with 3v3 stadium
        this.room.haxRoom.stopGame();
        this.room.haxRoom.setCustomStadium(loadMap('futsal_3v3'));
        this.room.startGame();
    }

    onPlayerJoin(): void {
        // if there are more than 11 player, change to 4v4
        if (this.room.haxRoom.getPlayerList().length > 7) {
            this.room.state = new RoomState4v4(this.room);
        }
    }

    onPlayerLeave(): void {
        // if there are less than 6 player, change to 2v2
        if (this.room.haxRoom.getPlayerList().length < 6) {
            this.room.state = new RoomState2v2(this.room);
        }
    }
}

class RoomState4v4 extends RoomState {
    constructor(room: Room) {
        console.log("4v4 started!")
        super(room);
        // initialize with 4v4 stadium
        this.room.haxRoom.stopGame();
        this.room.haxRoom.setCustomStadium(loadMap('futsal_4v4'));
        this.room.startGame();
    }

    onPlayerJoin(): void {
    }

    onPlayerLeave(): void {
        // if there are less than 8 player, change to 3v3
        if (this.room.haxRoom.getPlayerList().length < 8) {
            this.room.state = new RoomState3v3(this.room);
        }
    }

}

export default Room;