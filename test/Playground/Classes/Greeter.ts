namespace very.special {
    export class Class {
    }
    export interface Foo {
    }
}

export class Greeter implements very.special.Foo {
    greeting: string;
    prefix: string = "Hello, ";
    constructor(message: string) {
        this.greeting = message;
    }
    set prefix(prefix: string) {
        this.prefix = prefix;
    }
    greet(prefix: string = "Foo"): string;
    greet(): string {
        return this.prefix + this.greeting;
    }
}
}
