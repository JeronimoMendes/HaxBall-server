import RoomState from "./RoomState";
import RoomStateWaiting from "./RoomStateWaiting";
import RoomState2v2 from "./RoomState2v2";

import Room from "../Room";
import Player from "../Player";
import { Log, writeCSV } from "../utils";

class RoomState1v1 extends RoomState {
    constructor(room: Room) {
        if (room.players.length < 2)
            throw new Error("Not enough players to start 1v1: " + room.players.length);

        if (room.players.length > 3)
            throw new Error("Too many players to start 1v1: " + room.players.length);

        Log.info("1v1 started!")
        super(room);
        this.swapStadium('futsal_1v1');
        this.room.startGame();
    }
    
    onPlayerJoin(): void {
        // if there are more than 3 player, change to 2v2
        if (this.room.players.length > 3) {
            this.swapState(new RoomState2v2(this.room));
        }
    }

    onPlayerLeave(player: Player): void {
        // if there are less than 2 player, change to waiting
        if (this.room.players.length < 2) {
            this.swapState(new RoomStateWaiting(this.room));
        } else {
            this.replaceLeavingPlayer(player);
        }     
    }

    saveGameKicks(kicks: string): void {
        writeCSV(kicks, "xG1v1");
    }
}

export default RoomState1v1;