import Player from "../Player";

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

export {
    MeCommand,
    QuitCommand,
    AboutCommand,
    HelpCommand,
};
