import RoomState from "./RoomState";
import RoomState3v3 from "./RoomState3v3";

import Room from "../Room";
import Player from "../Player";
import { Log, loadMap, writeCSV } from "../utils";

class RoomState4v4 extends RoomState {
    constructor(room: Room) {
        if (room.players.length < 8)
            throw new Error("Not enough players to start 4v4");

        Log.info("4v4 started!")
        super(room);
        this.swapStadium('futsal_4v4');
        this.room.startGame();
    }

    onPlayerJoin(): void {
    }

    onPlayerLeave(player: Player): void {
        // if there are less than 8 player, change to 3v3
        if (this.room.players.length < 8) {
            this.swapState(new RoomState3v3(this.room));
        } else {
            super.replaceLeavingPlayer(player);
        }  
    }

    saveGameKicks(kicks: string): void {
        writeCSV(kicks, "xG4v4");
    }
}

export default RoomState4v4;