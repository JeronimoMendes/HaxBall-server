import Room from "../Room";
import Player from "../Player";
import { colors } from "../style";

abstract class Ballot {
    _room: Room;
    _callback: (result: string) => void;
    _votes: Map<Player, string> = new Map();

    constructor(room: Room, callback: (result: string) => void) {
        this._room = room;
        this._callback = callback;
    }

    abstract castVote(player: Player, vote: string): void;
}


class ChangeGameModeBallot extends Ballot {
    _gameMode1: string;
    _gameMode2: string;
    _votes1: number = 0;
    _votes2: number = 0;

    constructor(room: Room, callback: (result: string) => void, gameMode1: string, gameMode2: string) {
        super(room, callback);
        this._gameMode1 = gameMode1;
        this._gameMode2 = gameMode2;

        this._room.sendAnnouncement(
            `A voting will start to determine if we continue playing the current ${this._gameMode1} game or if we start a new ${this._gameMode2}`,
            colors.red,
            "bold",
            0
        );

        this._room.sendAnnouncement(
            `Use !vote ${this._gameMode1} or !vote ${this._gameMode2} to cast your vote`,
            colors.red,
            "bold",
            0
        );
    }

    castVote(player: Player, vote: string): void {
        if (vote !== this._gameMode1 && vote !== this._gameMode2) {
            player.sendMessage("Invalid vote: " + vote);
            player.sendMessage("Please vote for either " + this._gameMode1 + " or " + this._gameMode2);
        }

        if (this._votes.has(player)) {
            player.sendMessage("You have already voted for " + this._votes.get(player));
            return;
        }

        this._votes.set(player, vote);
        vote === this._gameMode1 ? this._votes1++ : this._votes2++;

        player.sendMessage("Your vote was registered as: " + vote);

        if (this._votes1 > this._room.players.length / 2 || this._votes2 > this._room.players.length / 2 || this._votes.size === this._room.players.length) {
            const winner = this.determineWinner();

            const nrWinnerVotes = winner === this._gameMode1 ? this._votes1 : this._votes2;
            this._room.sendAnnouncement(
                `The voting is over, the winner is ${winner} with ${nrWinnerVotes} votes`,
                colors.red,
                "bold",
                0
            );

            this._callback(winner);
        }
    }

    determineWinner(): string {
        return this._votes1 > this._votes2 ? this._gameMode1 : this._gameMode2;
    }
}


export {
    Ballot,
    ChangeGameModeBallot,
};