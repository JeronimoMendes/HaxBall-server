import RoomState from "./RoomState";
import RoomState2v2 from "./RoomState2v2";
import RoomState4v4 from "./RoomState4v4";

import Room from "../Room";
import Player from "../Player";
import { Log, writeCSV } from "../utils";
import { colors } from "../style";

class RoomState3v3 extends RoomState {
    constructor(room: Room) {
        super(room);
        if (room.players.length < 6) {
            this.swapState(new RoomState2v2(room));
        }

        if (room.players.length > 7) {
            this.swapState(new RoomState4v4(room));
        }

        Log.info("3v3 started!")
        this.swapStadium('futsal_3v3');
        this.room.startGame();
    }

    onPlayerJoin(player: Player): void {
        // if there are more than 11 player, change to 4v4
        if (this.room.players.length > 7) {
            if (!this.startChangeModeBallot('3v3', '4v4')) {
                player.sendMessage(this.room.currentBallot!.initialMessage, colors.red, "bold")
            }
        }
    }

    onPlayerLeave(player: Player): void {
        // if there are less than 6 player, change to 2v2
        if (this.room.players.length < 6) {
            this.swapState(new RoomState2v2(this.room));
        } else {
            this.replaceLeavingPlayer(player);
        }  
    } 

    onTeamVictory(): void {
        if (this.room.players.length > 7) {
            this.swapState(new RoomState4v4(this.room));
        } 
    }

    onBallotResult(result: string): void {
        if (result === "4v4") 
            this.swapState(new RoomState4v4(this.room));
    }

    saveGameKicks(kicks: string): void {
        writeCSV(kicks, "xG3v3");
    }
}

export default RoomState3v3;