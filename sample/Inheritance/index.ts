import { Animal } from "./Animal";
import { Horse } from "./Horse";
import { Snake } from "./Snake";

let sam = new Snake("Sammy the Python");
let tom: Animal = new Horse("Tommy the Palomino");

sam.move();
tom.move(34);