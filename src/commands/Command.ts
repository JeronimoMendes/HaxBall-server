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

export {
    MeCommand,
    QuitCommand
};
