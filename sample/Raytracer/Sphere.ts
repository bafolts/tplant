import { Thing } from "./Thing";
import { Vector } from "./Vector";
import { Surface } from "./Surface";
import { Ray } from "./Ray";

export class Sphere implements Thing {

    radius2: number;

    constructor(public center: Vector, radius: number, public surface: Surface) {
        this.radius2 = radius * radius;
    }

    normal(pos: Vector): Vector {
        return Vector.norm(Vector.minus(pos, this.center));
    }

    intersect(ray: Ray) {
        let eo = Vector.minus(this.center, ray.start);
        let v = Vector.dot(eo, ray.dir);
        let dist = 0;
        if (v >= 0) {
            let disc = this.radius2 - (Vector.dot(eo, eo) - v * v);
            if (disc >= 0) {
                dist = v - Math.sqrt(disc);
            }
        }
        if (dist === 0) {
            return null;
        } else {
            return { thing: this, ray: ray, dist: dist };
        }
    }

}