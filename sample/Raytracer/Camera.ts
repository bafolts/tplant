import { Vector } from "./Vector";

export class Camera {

    forward: Vector;
    right: Vector;
    up: Vector;

    constructor(public pos: Vector, lookAt: Vector) {
        let down = new Vector(0.0, -1.0, 0.0);
        this.forward = Vector.norm(Vector.minus(lookAt, this.pos));
        this.right = Vector.times(1.5, Vector.norm(Vector.cross(this.forward, down)));
        this.up = Vector.times(1.5, Vector.norm(Vector.cross(this.forward, this.right)));
    }

}