import RoomState from "./RoomState";
import RoomState3v3 from "./RoomState3v3";

import Room from "../Room";
import Player from "../Player";
import { Log, writeCSV } from "../utils";
import { PitchDimensions, dimensions } from "./stadiums";

class RoomState4v4 extends RoomState {
    constructor(room: Room) {
        super(room);
        if (room.players.length < 8) {
            this.swapState(new RoomState3v3(room));
        }

        Log.info("4v4 started!")
        this.swapStadium('futsal_4v4');
        this.room.startGame();
    }

    onPlayerJoin(player: Player): void {
    }

    onPlayerLeave(player: Player): void {
        // if there are less than 8 player, change to 3v3
        if (this.room.players.length < 8) {
            this.swapState(new RoomState3v3(this.room));
        } else {
            super.replaceLeavingPlayer(player);
        }  
    }

    onTeamVictory(): void {
        
    }

    saveGameKicks(kicks: string): void {
        writeCSV(kicks, "xG4v4");
    }

    onBallotResult(result: string): void {
    }

    getPitchDimensions(): PitchDimensions {
        return dimensions['4v4'];
    }
}

export default RoomState4v4;