
import { Test } from "./Class";

interface Interface {

    someAttribute(): void;
    someProperty: number;
    missingType();

}

class SubClass extends Test implements Interface {

}

