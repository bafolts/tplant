namespace NamespaceTest {
    export class B extends A {
        private a: A;

        constructor() {
            super();
            this.a = new A();
        }

        public sayHello(): void {
            console.log("Hello from B");
            this.a.sayHello();
            super.sayHello();
        }
    }
}
