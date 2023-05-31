import { MeCommand, QuitCommand, AboutCommand, HelpCommand, VoteCommand } from "./Command";
import Player from "../Player";
import Room from "../Room";

class CommandFactory {
    constructor(room: Room) {
    }

    static createCommand(commandName: string, args: string[], invoker: Player, room: Room) {
        switch (commandName) {
            case "me":
                return new MeCommand(invoker);
            case "bb":
                return new QuitCommand(invoker);
            case "about":
                return new AboutCommand(invoker);
            case "help":
                return new HelpCommand(invoker);
            case "vote":
                if (room.currentBallot === null) {
                    invoker.sendMessage("There is no voting going on right now!");
                    return null;
                }
                return new VoteCommand(invoker, args, room.currentBallot);
            default:
                return null;
        }
    }
}

export default CommandFactory;