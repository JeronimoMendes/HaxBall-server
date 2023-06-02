import Player from "../Player";
import { Ballot } from "../votes/ballot";
import Room from "../Room";

abstract class Command {
    _invoker: Player

    constructor(invoker: Player) {
        this._invoker = invoker
    }

    abstract execute(): void
}

class HelpCommand extends Command {
    execute(): void {
        const message: string = "Available commands:\n" +
            "!me - get your stats\n" +
            "!vote <choice>- vote for the current ballot\n" +
            "!afk - toggle afk mode\n" +
            "!afks - list all afk players\n" +
            "!about - get info about this server\n" +
            "!bb - quit the game\n" +
            "!help - get this message";
        this._invoker.sendMessage(message);
    }
}

class MeCommand extends Command {
    execute(): void {
        // get stats from player
        const stats: string = this._invoker.toString()

        this._invoker.sendMessage("Your stats: \n" + stats);
    }
}

class QuitCommand extends Command {
    execute(): void {
        this._invoker.kick("Goodbye!");
    }
}

class AboutCommand extends Command {
    execute(): void {
        const message: string = "This server is programmed by @🍍Stilton#4932\nIt's main objective is to gather data and train a predictive xG model.\nFeel free to contribute at https://github.com/JeronimoMendes/HaxBall-server"
        this._invoker.sendMessage(message);
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
            this._invoker.sendMessage("Please specify your vote!");
            return;
        }

        if (this._args.length > 1) {
            this._invoker.sendMessage("Please specify only one vote!");
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
            this._invoker.sendMessage("You are no longer AFK!");
        } else {
            this._room.setPlayerAFK(this._invoker)
            this._invoker.sendMessage("You are now AFK!");
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
            this._invoker.sendMessage("There are no AFK players!");
            return;
        }

        let message: string = "AFK players:\n";
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
            this._invoker.sendMessage("You are not an admin!");
            return;
        }

        const playerNameToMute: string = this._args.join(" ");
        const playerToMute: Player | undefined = this._room.getPlayerByName(playerNameToMute);

        if (playerToMute === undefined) {
            this._invoker.sendMessage("Player not found!");
            return;
        }

        playerToMute.muted = true;
        this._invoker.sendMessage("Player " + playerToMute.name + " is now muted!");
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
            this._invoker.sendMessage("You are not an admin!");
            return;
        }

        const mutedPlayers: Player[] = this._room.players.filter((player: Player) => {
            return player.muted;
        });

        if (mutedPlayers.length === 0) {    
            this._invoker.sendMessage("There are no muted players!");
            return;
        }

        let message: string = "Muted players:\n";
        mutedPlayers.forEach((player: Player) => {
            message += player.name + "\n";
        });
        
        this._invoker.sendMessage(message);
    }
}

export {
    MeCommand,
    QuitCommand,
    AboutCommand,
    HelpCommand,
    VoteCommand,
    AFKCommand,
    ListAFKCommand,
    MuteCommand,
    MutedCommand,
};
