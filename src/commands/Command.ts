import Player from "../Player";

abstract class Command {
    _invoker: Player

    constructor(invoker: Player) {
        this._invoker = invoker
    }

    abstract execute(): void
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
        const message: string = "This server is programmed by @🍍Stilton#4932\nIt's main objective is to gather data and train a predictive xG model."
        this._invoker.sendMessage(message);
    }
}

export {
    MeCommand,
    QuitCommand,
    AboutCommand
};
