import DiscPropertiesObject from "haxball.js"
import Room from "./Room";
import { Position, Velocity } from "./Common";
import { Log } from "./utils";

class Ball {
    _ball: DiscPropertiesObject = {} as DiscPropertiesObject;

    constructor(room: Room) {
        const numberDiscs = room.haxRoom.getDiscCount();
        for (let i = 0; i < numberDiscs; i++) {
            const disc = room.haxRoom.getDiscProperties(i);
            if (disc.cGroup == 193) {
                this._ball = disc;
                break;
            }
        }
    }

    get position(): Position {
        return { x: this._ball.x, y: this._ball.y };
    }

    get velocity(): Velocity {
        return { x: this._ball.x, y: this._ball.y };
    }
}

export default Ball;