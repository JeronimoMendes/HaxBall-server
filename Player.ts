import PlayerObject from 'haxball.js'
import RoomObject from 'haxball.js'

interface PlayerSerialized {
    name: string,
    goals: number,
    assists: number,
    ownGoals: number
}

class Player {
    private _haxPlayer: PlayerObject
    private _room: RoomObject
    private _isAdmin: boolean = false
    goals: number = 0
    assists: number = 0
    ownGoals: number = 0

    constructor(haxPlayer: PlayerObject, room: RoomObject, serialized?: PlayerSerialized) {
        this._haxPlayer = haxPlayer
        this._room = room
        if (serialized) {
            this.goals = serialized.goals
            this.assists = serialized.assists
            this.ownGoals = serialized.ownGoals
        }
    }

    get id(): number {
        return this._haxPlayer.id
    }

    get name(): string {
        return this._haxPlayer.name
    }

    get team(): number {
        return this._haxPlayer.team
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
            name: this.name,
            goals: this.goals,
            assists: this.assists,
            ownGoals: this.ownGoals
        }
    }
}

export default Player;