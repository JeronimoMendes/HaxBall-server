import Room from "../Room";
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
        this._invoker.sendMessage(`You are ${this._invoker.name}`)
    }
}

export {
    MeCommand
};
