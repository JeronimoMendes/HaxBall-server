import * as fs from 'fs';


interface PlayerSerialized {
    goals: number,
    assists: number,
    ownGoals: number
    wins: number,
    losses: number
    isAdmin: boolean
}

class Player {
    private _haxPlayer: PlayerObject
    private _room: RoomObject
    private _isAdmin: boolean = false
    private _team: number = 0
    private _goals: number = 0
    assists: number = 0
    private _ownGoals: number = 0
    private _wins: number = 0
    private _losses: number = 0

    constructor(haxPlayer: PlayerObject, room: RoomObject) {
        this._haxPlayer = haxPlayer
        this._room = room

        // fetch stats from file
        let serialized: PlayerSerialized | null = null;
        const statsObject = fs.readFileSync(`./stats/players.json`, 'utf-8')
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
        }

        if (this._isAdmin) {
            this._room.setPlayerAdmin(this.id, true)
        }
    }

    get goals(): number {
        return this._goals
    }

    set goals(goals: number) {
        this._goals = goals
        this.saveStats()
    }

    get ownGoals(): number {
        return this._ownGoals
    }

    set ownGoals(ownGoals: number) {
        this._ownGoals = ownGoals
        this.saveStats()
    }

    get wins(): number {
        return this._wins
    }

    set wins(wins: number) {
        this._wins = wins
        // this.saveStats()
    }

    get losses(): number {
        return this._losses
    }

    set losses(losses: number) {
        this._losses = losses
        // this.saveStats()
    }

    get id(): number {
        return this._haxPlayer.id
    }

    get name(): string {
        return this._haxPlayer.name
    }

    get team(): number {
        return this._team
    }

    set team(team: number) {
        this._team = team
        this._room.setPlayerTeam(this.id, team)
    }

    get position(): { x: number, y: number } {
        return this._haxPlayer.position
    }

    set isAdmin(isAdmin: boolean) {
        this.isAdmin = isAdmin
        this._room.setPlayerAdmin(this.id, isAdmin)
    }

    get isAdmin(): boolean {
        return this._isAdmin
    }

    serialize(): PlayerSerialized {
        return {
            goals: this._goals,
            assists: this.assists,
            ownGoals: this._ownGoals,
            wins: this._wins,
            losses: this._losses,
            isAdmin: this._isAdmin
        }
    }

    saveStats() {
        let statsObject: any = {}

        const data: string = fs.readFileSync(`./stats/players.json`, 'utf-8')
        statsObject = JSON.parse(data)
        statsObject[this.name] = this.serialize()
        fs.writeFile(`./stats/players.json`, JSON.stringify(statsObject, null, 2), (err) => {})
    }
}

export default Player;