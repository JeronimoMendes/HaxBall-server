import { MeCommand, QuitCommand } from "./Command";
import Player from "../Player";

class CommandFactory {
    constructor() {
    }

    static createCommand(commandName: string, invoker: Player) {
        switch (commandName) {
            case "me":
                return new MeCommand(invoker);
            case "bb":
                return new QuitCommand(invoker) 
            default:
                return null;
        }
    }
}

export default CommandFactory;