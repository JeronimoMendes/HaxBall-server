import Game from './Game';
import Kick from './Kick';
import Player from './Player';
import CommandFactory from './commands/CommandFactory';
import { incrementAssists, incrementGoals, incrementLosses, incrementOwnGoals, incrementWins } from './db/db';
import RoomState from './states/RoomState';
import RoomStateWaiting from './states/RoomStateWaiting';
import { PitchDimensions } from "./states/stadiums";
import { Kit, colors, kits } from './style';
import translator from './translations/translator';
import { Log, drawPlayersOnTeams } from './utils';
import { Ballot } from './votes/ballot';


class Room {
    state: RoomState;
    haxRoom: RoomObject;
    players: Player[] = [];
    afkPlayers: Player[] = [];
    previousKicker: Player | null = null;
    kicker: Player | null = null;
    winningTeam: Player[] = [];
    gameKicks: Kick[] = [];
    currentGame: Game | null = null;
    currentBallot: Ballot | null = null;

    constructor(haxRoom: RoomObject) {
        this.haxRoom = haxRoom;
        this.state = new RoomStateWaiting(this, true);

        this.haxRoom.setScoreLimit(3);
        this.haxRoom.setTimeLimit(3);

        this.changeTeamColors(kits.redDefault, 1);
        this.changeTeamColors(kits.blueDefault, 2);

        this.haxRoom.onPlayerJoin = (player: PlayerObject) => {
            let newPlayer = new Player(player, this.haxRoom);
            this.players.push(newPlayer);
            this.onPlayerJoin(newPlayer);
            newPlayer.sendMessage(
                translator.translate("welcome message"),
                colors.red,
                "bold",
                2
            );
        }

        this.haxRoom.onPlayerLeave = (player: PlayerObject) => {
            const oldPlayer = this.getPlayerByName(player.name);
            if (!oldPlayer) return;
            this.onPlayerLeave(oldPlayer);
        }

        this.haxRoom.onGameStop = () => {
            this.startGame();
        }

        this.haxRoom.onTeamVictory = (score) => {
            Log.info("Game ended! " + score.red + " : " + score.blue);

            const winningTeam = score.red > score.blue ? 1 : 2;
            const winningTeamName = winningTeam == 1 ? "Red" : "Blue";
            const msgColor = winningTeam == 1 ? colors.red : colors.blue;
            this.haxRoom.sendAnnouncement(winningTeamName + " won! " + + score.red + " : " + score.blue, undefined, msgColor, "bold", 2);
            this.onTeamVictory(winningTeam);
        }

        this.haxRoom.onRoomLink = (link) => {
            Log.info("Room link: " + link);
        }

        this.haxRoom.onPlayerBallKick = (haxPlayer) => {
            const player = this.getPlayerByName(haxPlayer.name);
            if (!player) return;

            this.onPlayerKick(player);
        }

        this.haxRoom.onTeamGoal = (team) => {
            const teamColor = (team == 1) ? colors.red : colors.blue;

            if (this.kicker == null) return;
            if (this.checkAssist()) {
                this.haxRoom.sendAnnouncement(this.kicker.name + " scored! Assisted by " + this.previousKicker?.name, undefined, teamColor, "bold", 2)
            } else {
                this.haxRoom.sendAnnouncement(this.kicker.name + " scored!", undefined, teamColor, "bold", 2);
            }

            this.onTeamGoal(team);
        }

        this.haxRoom.onPlayerChat = (haxPlayer, message) => {
            const player = this.getPlayerByName(haxPlayer.name);
            if (!player) return false;

            if (message.startsWith("!")) {
                // strip the ! from the message
                message = message.substring(1);

                if (!player) return false;
                
                const commandName = message.split(" ")[0];
                const commandArgs = message.split(" ").slice(1);
                const command = CommandFactory.createCommand(commandName, commandArgs, player, this);
                if (command) {
                    command.execute();
                } else {
                    player.sendMessage(translator.translate("unknown command"), colors.red, "bold", 2);
                }
                return false;
            }

            if (player.muted) {
                player.sendMessage(`${player.name}: ${message}`, colors.white, "normal", 1, false);
                return false;
            }
            return true;
        }

        this.haxRoom.onGameStart = () => {
            this.onGameStart();
        }

        this.haxRoom.onPlayerTeamChange = (changedPlayer: PlayerObject, byPlayer: PlayerObject) => {
            if (byPlayer == null) return;

            const player = this.getPlayerByName(changedPlayer.name);
            const admin = this.getPlayerByName(byPlayer.name);
            const team = changedPlayer.team;
            
            if (admin && player)
                this.onAdminMovePlayer(player, team);
        }, 

        this.haxRoom.onPlayerActivity = (haxPlayer: PlayerObject) => {
            const player = this.getPlayerByName(haxPlayer.name);
            if (!player) return;

            this.onPlayerActivity(player);
        }
         
        this.haxRoom.onGameTick = () => {
            this.onGameTick();
        }
    }

    onPlayerJoin(player: Player): void {
        Log.info(player.name + " just joined!");
        this.state.onPlayerJoin(player);
    }

    onPlayerLeave(leavingPlayer: Player): void {
        Log.info(leavingPlayer.name + " just left!");
        this.players = this.players.filter((player) => player.name != leavingPlayer.name);
        this.afkPlayers = this.afkPlayers.filter((player) => player.name != leavingPlayer.name);
        this.state.onPlayerLeave(leavingPlayer);
    }

    onPlayerKick(player: Player): void {
        this.previousKicker = player == this.kicker ? null : this.kicker;
        this.kicker = player;
        if (this.currentGame == null) return;
        
        const newKick = new Kick(player, this, this.currentGame.id);
        this.gameKicks.push(newKick);
    }

    onTeamGoal(team: TeamID): void {
        if (this.kicker == null || this.currentGame == null) return;

        if (team == 1)
            this.currentGame.redGoals += 1;
        else
            this.currentGame.blueGoals += 1;

        if (this.kicker.team == team) {
            incrementGoals(this.kicker, this.state.toString());

            if (this.gameKicks.length > 0)
                this.gameKicks[this.gameKicks.length - 1].goal = true;

            if (this.previousKicker != null) {
                if (this.checkAssist())
                    incrementAssists(this.previousKicker, this.state.toString());
            }
        } else {
            incrementOwnGoals(this.kicker, this.state.toString());
            this.kicker.ownGoals++;
        }
    }

    onTeamVictory(winningTeam: number): void {
        this.winningTeam = this.players.filter((player) => player.team == winningTeam);
        const losingTeam: Player[] = this.players.filter((player) => player.team != winningTeam);

        this.winningTeam.forEach((player) => incrementWins(player, this.state.toString()));
        losingTeam.forEach((player) => incrementLosses(player, this.state.toString()));

        this.gameKicks = [];
        this.currentGame?.endGame();
        this.state.onTeamVictory();
    }

    onGameStart(): void {
        this.currentGame = new Game(this.state.toString());

        // determine MVP
        if (this.players.length == 0) return;
        const mvp = this.players.reduce((prev, current) => {
            return (prev.gamePoints() > current.gamePoints()) ? prev : current
        });

        if (mvp != null && mvp.gamePoints() > 0) {
            this.sendAnnouncement(translator.translate("mvp", {
                "player": mvp.name,
                "points": mvp.gamePoints()
            }), colors.yellow, "bold", 2);
        }

        this.players.forEach((player) => player.resetGameStats());
        this.afkPlayers.forEach((player) => player.resetGameStats());
    }

    onAdminMovePlayer(player: Player, team: TeamID): void {
        player.adminMoveTeam(team);
    }

    startGame(): void {
        Log.info("Starting game...")
        this.shuffleTeams();
        this.haxRoom.startGame();

        // pause the game to give players time to get ready
        this.haxRoom.pauseGame(true);

        const now = Date.now();
        this.players.forEach((player) => {
            player.lastActivityTimestamp = now;
            player.lastAFKWarningTimestamp = now;
        });

        // there's a small delay in-game when unpausing the game so there's no need 
        // to simulate a delay here
        this.haxRoom.pauseGame(false);
    }

    endGame(): void {
        Log.info("Ending game...")
        if (this.currentGame == null) return;
        this.haxRoom.stopGame();

        this.gameKicks = [];
        this.currentGame.endGame();
    }

    shuffleTeams(): void {
        // Remove players that are not in the room anymore from the winning team
        this.winningTeam = this.winningTeam.filter((player) => this.players.includes(player));

        drawPlayersOnTeams(this.haxRoom, this.players, this.winningTeam);
    }

    getPlayerByName(name: string): Player | undefined {
        let player = this.players.find((player) => player.name == name);
        if (player) return player;

        return this.afkPlayers.find((player) => player.name == name);
    }

    sendAnnouncement(message: string, color?: number, style?: string, size?: number): void {
        this.haxRoom.sendAnnouncement(message, undefined, color, style, size);
    }

    setPlayerAFK(player: Player): void {
        this.players = this.players.filter((p) => p.name != player.name);
        this.afkPlayers.push(player);
        this.state.onPlayerLeave(player);
        player.afk = true;
    }

    setPlayerActive(player: Player): void {
        this.afkPlayers = this.afkPlayers.filter((p) => p.name != player.name);
        player.afk = false;
        this.players.push(player);
        this.state.onPlayerJoin(player);
    }

    changeTeamColors(kit: Kit, team: TeamID) {
        this.haxRoom.setTeamColors(team, kit.angle, kit.textColor, kit.colors);
    }

    getPitchDimensions(): PitchDimensions {
        return this.state.getPitchDimensions();
    }

    checkAssist() {
        return this.kicker?.team == this.previousKicker?.team && this.kicker != this.previousKicker;
    }
    
    onPlayerActivity(player: Player) {
        Log.debug("Player activity: " + player.name)
        player.lastActivityTimestamp = Date.now();
    }

    onGameTick() {
        const now = Date.now();
        this.players.forEach((player) => {
            if (player.afk || player.team === 0) {
                Log.debug("Skipping player " + player.name + " because they are AFK or in the lobby");
                return;
            };

            const secondsSinceLastActivity = (now - player.lastActivityTimestamp) / 1000;
            const secondsSinceLastWarning = (now - player.lastAFKWarningTimestamp) / 1000;
            
            if (secondsSinceLastActivity > 10) {
                this.setPlayerAFK(player);
            } else if (secondsSinceLastActivity > 3 && secondsSinceLastWarning > 1) {
                player.sendMessage(translator.translate("afk warning"), colors.yellow, "bold", 2);
                player.lastAFKWarningTimestamp = now;
            }
        });
    }
};

export default Room;