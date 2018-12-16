export class Plane implements Thing {

    normal: (pos: Vector) => Vector;
    intersect: (ray: Ray) => Intersection;

    constructor(norm: Vector, offset: number, public surface: Surface) {
        this.normal = function(pos: Vector) { return norm; }
        this.intersect = function(ray: Ray): Intersection {
            let denom = Vector.dot(norm, ray.dir);

            if (denom > 0) {
                return null;
            }
            else {
                let dist = (Vector.dot(norm, ray.start) + offset) / (-denom);
                return { thing: this, ray: ray, dist: dist };
            }
        }
    }

}