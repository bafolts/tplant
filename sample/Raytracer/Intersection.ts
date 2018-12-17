import { Thing } from "./Thing";
import { Ray } from "./Ray";

export interface Intersection {
    thing: Thing;
    ray: Ray;
    dist: number;
}