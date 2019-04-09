export class Greeter {
    greeting: string;
    prefix: string = "Hello, ";
    constructor(message: string) {
        this.greeting = message;
    }
    set prefix(prefix: string) {
        this.prefix = prefix;
    }
    greet(): string {
        return this.prefix + this.greeting;
    }
}
