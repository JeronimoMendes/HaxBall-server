import RoomState from "./RoomState";
import RoomState1v1 from "./RoomState1v1";
import RoomState3v3 from "./RoomState3v3";

import Room from "../Room";
import Player from "../Player";
import { Log, writeCSV } from "../utils";

class RoomState2v2 extends RoomState {
    constructor(room: Room) {
        if (room.players.length < 4)
            throw new Error("Not enough players to start 2v2: " + room.players.length);

        if (room.players.length > 5)
            throw new Error("Too many players to start 2v2: " + room.players.length);

        Log.info("2v2 started!")
        super(room);
        this.swapStadium('futsal_2v2')
        this.room.startGame();
    }

    onPlayerJoin(): void {
        // if there are more than 7 player, change to 3v3
        if (this.room.players.length > 5) {
            this.swapState(new RoomState3v3(this.room));
        }
    }

    onPlayerLeave(player: Player): void {
        // if there are less than 4 player, change to 1v1
        if (this.room.players.length < 4) {
            this.swapState(new RoomState1v1(this.room));
        } else {
            this.replaceLeavingPlayer(player);
        }  
    }

    saveGameKicks(kicks: string): void {
        writeCSV(kicks, "xG2v2");
    }
}

export default RoomState2v2;