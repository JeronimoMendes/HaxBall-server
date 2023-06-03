import Player from "./Player";

type Vector = {
    x: number;
    y: number;
};

export type Position = {
    x: number;
    y: number;
    player: Player;
};

export type PositionBall = Vector;

export type Velocity = Vector;

export function crossProduct(a: Vector, b: Vector): number {
    return a.y * b.x - a.x * b.y;
}
