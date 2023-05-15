import { MeCommand } from "./Command";
import Player from "../Player";

class CommandFactory {
    constructor() {
    }

    static createCommand(commandName: string, invoker: Player) {
        switch (commandName) {
            case "me":
                return new MeCommand(invoker);
            default:
                return null;
        }
    }
}

export default CommandFactory;