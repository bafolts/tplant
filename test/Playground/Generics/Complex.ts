interface GenericInterface<T extends string> {
    method(arg: T): T;
}

interface GenericInterface2<T extends string> {
    property?: T;
}

interface GenericInterface3<T extends string, A extends number> extends GenericInterface2<T> {
    method2(arg: A): A;
}

class GenericClass<T extends string, A extends number> implements GenericInterface<T>, GenericInterface3<T, A> {
    property?: T;
    method(arg: T): T {
        return arg;
    }
    method2(arg: A): A {
        return arg;
    }
}

class GenericClass2<T extends string> implements GenericInterface2<T> {
    constructor(public property?: T) {}
}

class ConcreteClass extends GenericClass<string, number> implements GenericInterface<string>, GenericInterface2<string> {
    property: string;
}

interface GenericTypes {
    genericType: GenericClass<string, number>;
    genericType2: GenericClass2<string>;
    genericReturnType(): GenericInterface<string>;
    genericReturnType2(): GenericInterface3<string, number>;
    genericParameter(parameter: GenericInterface2<string>): void;
}