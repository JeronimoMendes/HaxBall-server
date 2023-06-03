import RoomState from "./RoomState";
import RoomStateWaiting from "./RoomStateWaiting";
import RoomState2v2 from "./RoomState2v2";

import Room from "../Room";
import Player from "../Player";
import { Log, writeCSV } from "../utils";
import { colors } from "../style";
import { PitchDimensions, dimensions } from "./stadiums";

class RoomState1v1 extends RoomState {
    constructor(room: Room) {
        super(room);
        if (room.players.length < 2) {
            this.swapState(new RoomStateWaiting(this.room));
        }

        if (room.players.length > 3) {
            this.swapState(new RoomState2v2(this.room));
        }

        Log.info("1v1 started!")
        this.swapStadium('futsal_1v1');
        this.room.startGame();
    }
    
    onPlayerJoin(player: Player): void {
        if (this.room.players.length > 3) {
            if (!this.startChangeModeBallot('1v1', '2v2')) {
                player.sendMessage(this.room.currentBallot!.initialMessage, colors.red, "bold")
            }
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

    onTeamVictory(): void {
        if (this.room.players.length > 3) {
            this.swapState(new RoomState2v2(this.room));
        }
    }

    onBallotResult(result: string): void {
        if (result === "2v2")
            this.swapState(new RoomState2v2(this.room));
    }

    saveGameKicks(kicks: string): void {
        writeCSV(kicks, "xG1v1");
    }

    getPitchDimensions(): PitchDimensions {
        return dimensions['1v1'];
    }

    toString(): string {
        return "1v1";
    }
}

export default RoomState1v1;