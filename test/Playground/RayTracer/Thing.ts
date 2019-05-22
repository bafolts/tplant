import { Ray } from "./Ray";
import { Intersection } from "./Intersection";
import { Vector } from "./Vector";
import { Surface } from "./Surface";

export interface Thing {
    intersect: (ray: Ray) => Intersection;
    normal: (pos: Vector) => Vector;
    surface: Surface;
    destroy(): void;
    destroy(name: string): void;
}
