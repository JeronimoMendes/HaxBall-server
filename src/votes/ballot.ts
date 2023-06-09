import Player from "../Player";
import Room from "../Room";
import { colors } from "../style";
import translator from "../translations/translator";

abstract class Ballot {
    _room: Room;
    _callback: (result: string) => void;
    _votes: Map<Player, string> = new Map();
    initialMessage: string = "";

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
        this.initialMessage = translator.translate("voting initial gamemode", {
            gameMode1: gameMode1,
            gameMode2: gameMode2
        });

        this._room.sendAnnouncement(
            this.initialMessage,
            colors.red,
            "bold",
            0
        );

        this._room.sendAnnouncement(
            translator.translate("voting gamemode options", {
                gameMode1: gameMode1,
                gameMode2: gameMode2
            }),
            colors.red,
            "bold",
            0
        );
    }

    castVote(player: Player, vote: string): void {
        if (vote !== this._gameMode1 && vote !== this._gameMode2) {
            player.sendMessage(translator.translate("invalid vote", { vote: vote }));
            player.sendMessage(translator.translate("voting gamemode options", {
                gameMode1: this._gameMode1,
                gameMode2: this._gameMode2
            }));
            return;
        }

        if (this._votes.has(player)) {
            player.sendMessage(translator.translate("duplicate vote", { vote: this._votes.get(player)}));
            return;
        }

        this._votes.set(player, vote);
        vote === this._gameMode1 ? this._votes1++ : this._votes2++;

        const admins: Player[] = this._room.players.filter(player => player.isAdmin);
        admins.forEach(admin => {
            if (player !== admin) {
                admin.sendMessage(
                    `${player.name} voted.`, 
                    colors.yellow
                );
            }
            this._room.sendAnnouncement(
                translator.translate("someone voted", {
                    gameMode1: this._gameMode1,
                    votes1: this._votes1,
                    gameMode2: this._gameMode2,
                    votes2: this._votes2  
                }),
                colors.redSecondary,
            )
            this._room.players
                .filter(player => !this._votes.has(player))
                .forEach(player => {
                    player.sendMessage(
                        translator.translate("remember to cast vote", {
                            gameMode1: this._gameMode1,
                            gameMode2: this._gameMode2
                        }),
                        colors.red,
                        "bold"
                    )
                });
        });

        player.sendMessage(translator.translate("vote registered", { vote: vote }), colors.green, "bold");

        if (this._votes1 > this._room.players.length / 2 || this._votes2 > this._room.players.length / 2 || this._votes.size === this._room.players.length) {
            if (this._votes1 === this._votes2) { 
                this._room.sendAnnouncement(
                    translator.translate("voting tie gamemode", {gameMode: this._gameMode1}),
                    colors.red,
                    "bold",
                    0
                );
                this._room.currentBallot = null;
                return;
            }

            const winner = this.determineWinner();

            this._room.sendAnnouncement(
                translator.translate("voting won gamemode", {gameMode: winner}),
                colors.red,
                "bold",
                0
            );

            this._room.currentBallot = null;
            this._callback(winner);
        }
    }

    determineWinner(): string {
        return this._votes1 > this._votes2 ? this._gameMode1 : this._gameMode2;
    }
}


export {
    Ballot,
    ChangeGameModeBallot
};
