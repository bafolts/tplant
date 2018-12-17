import { Vector } from "./Vector";
import { Color } from "./Color";

export interface Light {
    pos: Vector;
    color: Color;
}