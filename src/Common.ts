type Vector = {
    x: number;
    y: number;
};

export type Position = Vector;

export type Velocity = Vector;

export function crossProduct(a: Vector, b: Vector): number {
    return a.y * b.x - a.x * b.y;
}
