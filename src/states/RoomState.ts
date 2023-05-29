import Room from "../Room";
import Player from "../Player";
import { loadMap } from "../utils";
import { colors } from "../style";

abstract class RoomState {
    protected room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    abstract onPlayerJoin(): void;
    abstract onPlayerLeave(player: Player): void;
    abstract saveGameKicks(kicks: string): void;

    replaceLeavingPlayer(player: Player): void {
        const team = player.team;

        // pick a random waiting player to replace the leaving player if he was playing
        if (team != 0) {
            const waitingPlayers = this.room.players.filter((player) => player.team == 0);
            if (waitingPlayers.length > 0) {
                const randomWaitingPlayer = waitingPlayers[Math.floor(Math.random() * waitingPlayers.length)];
                randomWaitingPlayer.team = team;

                this.room.haxRoom.sendAnnouncement(
                    `Substituting ${player.name} for ${randomWaitingPlayer.name}`,
                    undefined,
                    colors.green,
                    "bold",
                    2
                );
                this.room.haxRoom.pauseGame(true);
                this.room.haxRoom.pauseGame(false);
            }
        }
    };

    swapState(newState: RoomState): void {
        this.room.endGame();
        this.room.state = newState;
    }

    swapStadium(stadium: string): void {
        this.room.endGame();
        this.room.haxRoom.setCustomStadium(loadMap(stadium));
    }
}

export default RoomState;