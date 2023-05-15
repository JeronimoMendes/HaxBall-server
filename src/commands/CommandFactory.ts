import { MeCommand, QuitCommand, AboutCommand, HelpCommand } from "./Command";
import Player from "../Player";

class CommandFactory {
    constructor() {
    }

    static createCommand(commandName: string, invoker: Player) {
        switch (commandName) {
            case "me":
                return new MeCommand(invoker);
            case "bb":
                return new QuitCommand(invoker);
            case "about":
                return new AboutCommand(invoker);
            case "help":
                return new HelpCommand(invoker);
            default:
                return null;
        }
    }
}

export default CommandFactory;