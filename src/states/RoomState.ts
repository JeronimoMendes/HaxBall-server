import Player from "../Player";
import Room from "../Room";
import { colors } from "../style";
import translator from "../translations/translator";
import { loadMap } from "../utils";
import { ChangeGameModeBallot } from "../votes/ballot";
import { PitchDimensions } from "./stadiums";

abstract class RoomState {
    protected room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    abstract onPlayerJoin(player: Player): void;
    abstract onPlayerLeave(player: Player): void;
    abstract saveGameKicks(kicks: string): void;
    abstract onTeamVictory(): void;
    abstract onBallotResult(result: string): void;
    abstract getPitchDimensions(): PitchDimensions
    abstract toString(): string;

    replaceLeavingPlayer(player: Player): void {
        const team = player.team;

        // pick a random waiting player to replace the leaving player if he was playing
        if (team != 0) {
            const waitingPlayers = this.room.players.filter((player) => player.team == 0);
            if (waitingPlayers.length > 0) {
                const randomWaitingPlayer = waitingPlayers[Math.floor(Math.random() * waitingPlayers.length)];
                randomWaitingPlayer.team = team;

                this.room.haxRoom.sendAnnouncement(
                    translator.translate("substitution", {
                        playerOut: player.name,
                        playerIn: randomWaitingPlayer.name
                    }),
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
        this.room.currentBallot = null;
        this.room.haxRoom.setCustomStadium(loadMap(stadium));
    }

    startChangeModeBallot(currentGameMode: string, nextGameMode: string): boolean {
        // if there's an ongoing ballot don't start another one
        if (this.room.currentBallot) return false;

        this.room.currentBallot = new ChangeGameModeBallot(this.room, this.onBallotResult.bind(this), currentGameMode, nextGameMode);
        return true;
    }
}

export default RoomState;