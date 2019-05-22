import { Thing } from "./Thing";
import { Light } from "./Light";
import { Camera } from "./Camera";

export interface Scene {
    things: Thing[];
    lights: Light[];
    camera: Camera;
}