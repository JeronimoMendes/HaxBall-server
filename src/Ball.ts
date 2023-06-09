import Room from "./Room";
import { PositionBall, Velocity } from "./Common";

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

    get position(): PositionBall {
        return { x: this._ball.x, y: this._ball.y };
    }

    get velocity(): Velocity {
        return { x: this._ball.xspeed, y: this._ball.yspeed };
    }
}

export default Ball;