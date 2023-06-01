import RoomState from "./RoomState";
import RoomState1v1 from "./RoomState1v1";
import RoomState3v3 from "./RoomState3v3";

import Room from "../Room";
import Player from "../Player";
import { Log, writeCSV } from "../utils";
import { colors } from "../style";

class RoomState2v2 extends RoomState {
    constructor(room: Room) {
        super(room);
        if (room.players.length < 4) {
            this.swapState(new RoomState1v1(room));
        }

        if (room.players.length > 5) {
            this.swapState(new RoomState3v3(room));
        }

        Log.info("2v2 started!")
        this.swapStadium('futsal_2v2')
        this.room.startGame();
    }

    onPlayerJoin(player: Player): void {
        // if there are more than 7 player, change to 3v3
        if (this.room.players.length > 5) {
            if (!this.startChangeModeBallot('2v2', '3v3')) {
                player.sendMessage(this.room.currentBallot!.initialMessage, colors.red, "bold")
            }
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

    onTeamVictory(): void {
        if (this.room.players.length > 5) {
            this.swapState(new RoomState3v3(this.room));
        }
    }

    onBallotResult(result: string): void {
        if (result === "3v3") 
            this.swapState(new RoomState3v3(this.room));
    }

    saveGameKicks(kicks: string): void {
        writeCSV(kicks, "xG2v2");
    }
}

export default RoomState2v2;