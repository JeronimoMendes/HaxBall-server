import Player from "../Player";
import Room from "../Room";
import translator from "../translations/translator";
import {
    AFKCommand,
    AboutCommand,
    DiscordCommand,
    HelpCommand,
    ListAFKCommand,
    MVPCommand,
    MeCommand,
    MuteCommand,
    MutedCommand,
    QuitCommand,
    VoteCommand
} from "./Command";

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
                    invoker.sendMessage(translator.translate("no voting"));
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
            case "mvp":
                return new MVPCommand(invoker);
            case "discord":
                return new DiscordCommand(invoker, room);
            default:
                return null;
        }
    }
}

export default CommandFactory;