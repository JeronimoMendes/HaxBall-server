import Player, { PlayerStats } from "../Player";
import Room from "../Room";
import translator from "../translations/translator";
import { Log } from "../utils";
import { Ballot } from "../votes/ballot";

abstract class Command {
    _invoker: Player

    constructor(invoker: Player) {
        this._invoker = invoker
    }

    abstract execute(): void
}

class HelpCommand extends Command {
    execute(): void {
        this._invoker.sendMessage(translator.translate("help mssage"));
    }
}

class MeCommand extends Command {
    _args: string[]
    constructor(invoker: Player, args: string[]) {
        super(invoker)
        this._args = args
    }

    execute(): void {
        // get stats from player
        if (this._args.length > 1) {
            this._invoker.sendMessage(translator.translate("specify only one game mode"));
            return;
        }

        this._invoker.getStats(this._args[0] || undefined)
            .then((stats: PlayerStats | null) => {
                if (stats === null) {
                    Log.error(`Could not get stats for ${this._invoker.name}`);
                    this._invoker.sendMessage(translator.translate("no stats for player"));
                    return;
                }

                let formattedMessage: string = this._args[0] ? translator.translate("stats for game mode", { gameMode: this._args[0] }) : translator.translate("stats global");
                const totalGames: number = stats.wins + stats.losses;
                formattedMessage += translator.translate("stats", {
                    goals: stats.goals,
                    assists: stats.assists,
                    ownGoals: stats.ownGoals,
                    shotsPerGame: (stats.shots / totalGames).toPrecision(2),
                    savesPerGame: (stats.saves / totalGames).toPrecision(2),
                    passesPerGame: (stats.passes / totalGames).toPrecision(2),
                    wins: stats.wins,
                    losses: stats.losses
                })


                this._invoker.sendMessage(formattedMessage);
            })
    }
}

class QuitCommand extends Command {
    execute(): void {
        this._invoker.kick(translator.translate("quit message"));
    }
}

class AboutCommand extends Command {
    execute(): void {
        this._invoker.sendMessage(translator.translate("about message"));
    }
}


class VoteCommand extends Command {
    _args: string[]
    _ballot: Ballot

    constructor(invoker: Player, args: string[], ballot: Ballot) {
        super(invoker);
        this._args = args;
        this._ballot = ballot;
    }

    execute(): void {
        if (this._args.length == 0) {
            this._invoker.sendMessage(translator.translate("specify a vote"));
            return;
        }

        if (this._args.length > 1) {
            this._invoker.sendMessage(translator.translate("specify only one vote"));
            return;
        }

        this._ballot.castVote(this._invoker, this._args[0]);
    }
}


class AFKCommand extends Command {
    _room: Room
    constructor(invoker: Player, room: Room) {
        super(invoker);
        this._room = room;
    }

    execute(): void {
        if (this._invoker.afk === true) {
            this._room.setPlayerActive(this._invoker);
            this._invoker.sendMessage(translator.translate("afk on"));
        } else {
            this._room.setPlayerAFK(this._invoker)
            this._invoker.sendMessage(translator.translate("afk off"));
        }
    }
}


class ListAFKCommand extends Command {
    _room: Room
    constructor(invoker: Player, room: Room) {
        super(invoker);
        this._room = room;
    }

    execute(): void {
        if (this._room.afkPlayers.length === 0) {
            this._invoker.sendMessage(translator.translate("afk list empty"));
            return;
        }

        let message: string = translator.translate("afk list");
        this._room.afkPlayers.forEach((player: Player) => {
            message += player.name + "\n";
        });

        this._invoker.sendMessage(message);
    }
}

class MuteCommand extends Command {
    _room: Room
    _args: string[]
    constructor(invoker: Player, room: Room, args: string[]) {
        super(invoker);
        this._room = room;
        this._args = args;
    }

    execute(): void {
        if (!this._invoker.isAdmin) {
            this._invoker.sendMessage(translator.translate("not admin"));
            return;
        }

        const playerNameToMute: string = this._args.join(" ");
        const playerToMute: Player | undefined = this._room.getPlayerByName(playerNameToMute);

        if (playerToMute === undefined) {
            this._invoker.sendMessage(translator.translate("player not found"));
            return;
        }

        playerToMute.muted = !playerToMute.muted;
        if (playerToMute.muted) {
            this._invoker.sendMessage(translator.translate("player muted", { player: playerToMute.name }));
        } else {
            this._invoker.sendMessage(translator.translate("player unmuted", { player: playerToMute.name }));
        }
    }
}


class MutedCommand extends Command {
    _room: Room

    constructor(invoker: Player, room: Room) {
        super(invoker);
        this._room = room;
    }

    execute(): void {
        if (!this._invoker.isAdmin) {
            this._invoker.sendMessage(translator.translate("not admin"));
            return;
        }

        const mutedPlayers: Player[] = this._room.players.filter((player: Player) => {
            return player.muted;
        });

        if (mutedPlayers.length === 0) {    
            this._invoker.sendMessage(translator.translate("muted list empty"));
            return;
        }

        let message: string = translator.translate("muted list");
        mutedPlayers.forEach((player: Player) => {
            message += player.name + "\n";
        });
        
        this._invoker.sendMessage(message);
    }
}

export {
    AFKCommand, AboutCommand,
    HelpCommand, ListAFKCommand, MeCommand, MuteCommand,
    MutedCommand, QuitCommand, VoteCommand
};

