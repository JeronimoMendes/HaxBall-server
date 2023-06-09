import { MeCommand, QuitCommand, AboutCommand, HelpCommand, VoteCommand, AFKCommand, ListAFKCommand, MuteCommand, MutedCommand } from "./Command";
import Player from "../Player";
import Room from "../Room";

class CommandFactory {
    constructor(room: Room) {
    }

    static createCommand(commandName: string, args: string[], invoker: Player, room: Room) {
        switch (commandName) {
            case "me":
                return new MeCommand(invoker, args);
            case "bb":
                return new QuitCommand(invoker);
            case "about":
                return new AboutCommand(invoker);
            case "help":
                return new HelpCommand(invoker);
            case "v":
                if (room.currentBallot === null) {
                    invoker.sendMessage("There is no voting going on right now!");
                    return null;
                }
                return new VoteCommand(invoker, args, room.currentBallot);
            case "afk":
                return new AFKCommand(invoker, room);
            case "afks":
                return new ListAFKCommand(invoker, room);
            case "mute":
                return new MuteCommand(invoker, room, args);
            case "muted":
                return new MutedCommand(invoker, room);
            default:
                return null;
        }
    }
}

export default CommandFactory;