import { Position } from './Common';
import { createPlayer, getPlayer, getPlayerStats, updatePlayer } from './db/db';
import { Log } from './utils';


interface PlayerSerialized {
    name: string,
    isAdmin: boolean,
    muted: boolean
}

interface PlayerStats {
    goals: number,
    assists: number,
    shots: number,
    saves: number,
    passes: number,
    ownGoals: number,
    wins: number,
    losses: number
}

class Player {
    private _room: RoomObject
    id: number
    name: string
    private _isAdmin: boolean = false
    goals: number = 0
    assists: number = 0
    shots: number = 0
    saves: number = 0
    passes: number = 0
    private _ownGoals: number = 0
    private _wins: number = 0
    private _losses: number = 0
    private _team: number
    private _afk: boolean = false
    private _muted: boolean = false
    lastActivityTimestamp: number = 0
    lastAFKWarningTimestamp: number = 0

    constructor(haxPlayer: PlayerObject, room: RoomObject) {
        this.id = haxPlayer.id
        this.name = haxPlayer.name
        this._team = haxPlayer.team
        this._room = room

        getPlayer(this.name).then((res: PlayerSerialized) => {
            Log.debug(`Player ${this.name} found in db`)
            this.isAdmin = res.isAdmin
            this._muted = res.muted
        }, () => {
            // create player in db
            Log.debug(`Player ${this.name} not found in db`)
            createPlayer(this)
        })
    }

    get haxPlayer(): PlayerObject {
        return this._room.getPlayer(this.id)
    }

    get ownGoals(): number {
        return this._ownGoals
    }

    set ownGoals(ownGoals: number) {
        this._ownGoals = ownGoals
    }

    get wins(): number {
        return this._wins
    }

    set wins(wins: number) {
        this._wins = wins
    }

    get losses(): number {
        return this._losses
    }

    set losses(losses: number) {
        this._losses = losses
    }

    get team(): number {
        return this._team
    }

    set team(team: number) {
        this._team = team
        this._room.setPlayerTeam(this.id, team)
    }

    adminMoveTeam(team: number) {
        this._team = team
    }

    get position(): Position {
        return {
            x: this.haxPlayer.position.x,
            y: this.haxPlayer.position.y,
            player: this,
        }
    }

    set isAdmin(isAdmin: boolean) {
        this._isAdmin = isAdmin
        this._room.setPlayerAdmin(this.id, isAdmin)
    }

    get isAdmin(): boolean {
        return this._isAdmin
    }

    set afk(afk: boolean) {
        // send to spectator 
        if (afk) {
            this.team = 0;
            this._afk = true;
        } else {
            this._afk = false;
        }
    }

    get afk(): boolean {
        return this._afk;
    }

    get totalGames(): number {
        return this._wins + this._losses
    }

    get shotsPerGame(): string {
        return (this.shots / this.totalGames).toFixed(2)
    }

    get savesPerGame(): string {
        return (this.saves / this.totalGames).toFixed(2)
    }

    get passesPerGame(): string {
        return (this.passes / this.totalGames).toFixed(2)
    }

    get muted(): boolean {
        return this._muted
    }

    set muted(muted: boolean) {
        this._muted = muted;
        updatePlayer(this);
    }

    gamePoints(): number {
        let points = 0;

        points += this.goals * 8;
        points += this.assists * 4;
        points += this.saves * 3;
        points += this.passes * 2;
        points -= this.ownGoals * 5;

        return points;
    }

    resetGameStats() {
        this.goals = 0
        this.assists = 0
        this.shots = 0
        this.saves = 0
        this.passes = 0
        this.ownGoals = 0
    }

    sendMessage(message: string, color?: number | undefined, style?: string | undefined, sound: number = 1, formatted: boolean = true) {
        const formattedMessage: string = formatted ? "[Server] " + message : message;
        this._room.sendAnnouncement(formattedMessage, this.id, color, style, sound)
    }

    kick(reason: string) {
        this._room.kickPlayer(this.id, reason, false);
    }

    getStats(gameMode?: string): Promise<PlayerStats | null> {
        return getPlayerStats(this, gameMode).then((res: PlayerStats) => {
            return res;
        }).catch(() => {
            return null;
        });
    }
}

export default Player;
export { PlayerSerialized, PlayerStats };
