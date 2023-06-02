import * as fs from 'fs';
import { Position } from './Common';
import { Log, inDevelopment } from './utils';

const statsPath: string = inDevelopment ? `./stats-dev/players.json` : `./stats/players.json`

interface PlayerSerialized {
    goals: number,
    assists: number,
    ownGoals: number
    wins: number,
    losses: number
    isAdmin: boolean
    shots?: number
    saves?: number
    passes?: number
}

class Player {
    private _room: RoomObject
    id: number
    name: string
    private _isAdmin: boolean = false
    private _goals: number = 0
    assists: number = 0
    shots: number = 0
    saves: number = 0
    passes: number = 0
    private _ownGoals: number = 0
    private _wins: number = 0
    private _losses: number = 0
    private _team: number
    private _afk: boolean = false
    
    constructor(haxPlayer: PlayerObject, room: RoomObject) {
        this.id = haxPlayer.id
        this.name = haxPlayer.name
        this._team = haxPlayer.team
        this._room = room

        // fetch stats from file
        let serialized: PlayerSerialized | null = null;

        const statsObject = fs.readFileSync(statsPath, 'utf-8')
        let readPlayer = JSON.parse(statsObject)[this.name]
        if (readPlayer !== undefined) {
            serialized = readPlayer
        }

        if (serialized !== null) {
            this._goals = serialized.goals
            this.assists = serialized.assists
            this._ownGoals = serialized.ownGoals
            this._wins = serialized.wins
            this._losses = serialized.losses
            this._isAdmin = serialized.isAdmin
            this.shots = serialized.shots || 0
            this.saves = serialized.saves || 0
            this.passes = serialized.passes || 0
        }

        if (this._isAdmin) {
            this._room.setPlayerAdmin(this.id, true)
        }
    }

    get haxPlayer(): PlayerObject {
        return this._room.getPlayer(this.id)
    }

    get goals(): number {
        return this._goals
    }

    set goals(goals: number) {
        this._goals = goals
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

    get position(): Position {
        return this.haxPlayer.position;
    }

    set isAdmin(isAdmin: boolean) {
        this.isAdmin = isAdmin
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

    serialize(): PlayerSerialized {
        return {
            goals: this._goals,
            assists: this.assists,
            ownGoals: this._ownGoals,
            wins: this._wins,
            losses: this._losses,
            isAdmin: this._isAdmin,
            shots: this.shots,
            saves: this.saves,
            passes: this.passes
        }
    }

    toString(): string {
        return `Goals: ${this._goals}\n` +
        `Assists: ${this.assists}\n` +
        `Own Goals: ${this._ownGoals}\n` + 
        `Shot p/ game: ${this.shotsPerGame}\n` + 
        `Saves p/ game: ${this.savesPerGame}\n` + 
        `Passes p/ game: ${this.passesPerGame}\n` +
        `Wins: ${this._wins}\n` + 
        `Losses: ${this._losses}`
    }

    saveStats() {
        let statsObject: any = {}

        const data: string = fs.readFileSync(statsPath, 'utf-8')
        statsObject = JSON.parse(data)
        statsObject[this.name] = this.serialize()
        fs.writeFile(statsPath, JSON.stringify(statsObject, null, 2), (err) => {
            if (err) {
                Log.error(err.message);
            }
        })
    }

    sendMessage(message: string, color?: number | undefined, style?: string | undefined, sound: number = 1) {
        const formattedMessage = "[Server] " + message;
        this._room.sendAnnouncement(formattedMessage, this.id, color, style, sound)
    }

    kick(reason: string) {
        this._room.kickPlayer(this.id, reason, false);
    }
}

export default Player;