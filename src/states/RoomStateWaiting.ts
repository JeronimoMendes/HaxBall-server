import RoomState from "./RoomState";
import RoomState1v1 from "./RoomState1v1";

import Room from "../Room";
import Player from "../Player";
import { Log, loadMap, writeCSV } from "../utils";

class RoomStateWaiting extends RoomState {
    constructor(room: Room, initializing = false) {
        if (initializing) {
            Log.info("Initializing...")
            super(room);
            this.room.haxRoom.setCustomStadium(loadMap('futsal_waiting'));
        } else {
            if (room.players.length > 1)
                throw new Error("Too many players to start waiting: " + room.players.length);

            Log.info("Waiting for players...")
            super(room);
            this.swapStadium('futsal_waiting');
            this.room.startGame();
        }
    }

    onPlayerJoin(): void {
        // if there are more than 1 player, change to 1v1
        if (this.room.players.length > 1) {
            this.swapState(new RoomState1v1(this.room));
        } else {
            this.room.startGame();
        }
    }

    onPlayerLeave(player: Player): void {
    }

    onTeamVictory(): void {}

    saveGameKicks(kicks: string): void {
        writeCSV(kicks, "xGtest");
    }

    onBallotResult(result: string): void {
    }
}

export default RoomStateWaiting;