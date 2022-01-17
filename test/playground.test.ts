import * as os from 'os';
import { tplant } from '../src/tplant';

describe('Parse Playground codes', () => {

    it('generate PlantUML for Abstract/AbstractClass.ts', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Abstract/AbstractClass.ts'])))
            .toEqual(
                ['@startuml',
                    'abstract class AbstractClass {',
                    '    +{abstract} ToTest(): any',
                    '    +{abstract} PropTest: number',
                    '}',
                    '@enduml'].join(os.EOL)
            );
    });

    it('generate PlantUML for Classes/Greeter.ts', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Classes/Greeter.ts'])))
            .toEqual(
                ['@startuml',
                    'namespace very {',
                    '    namespace special {',
                    '        class Class',
                    '        interface Foo',
                    '    }',
                    '}',
                    'class Greeter implements very.special.Foo {',
                    '    +greeting: string',
                    '    +prefix: string',
                    '    +greet(prefix?: string): string',
                    '    +greet(): string',
                    '}',
                    '@enduml'].join(os.EOL));
    });

    it('generate PlantUML for Enum/Enum.ts', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Enum/Enum.ts'])))
            .toEqual(
                ['@startuml',
                    'enum Semaphore {',
                    '    RED',
                    '    GREEN',
                    '    YELLOW',
                    '}',
                    '@enduml'].join(os.EOL));
    });

    it('generate PlantUML for Inheritance', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Inheritance/index.ts'])))
            .toEqual(
                ['@startuml',
                    'class Animal {',
                    '    +name: string',
                    '    +move(distanceInMeters?: number): void',
                    '}',
                    'class Horse extends Animal {',
                    '    +move(distanceInMeters?: number): void',
                    '}',
                    'class Snake extends Animal {',
                    '    +move(distanceInMeters?: number): void',
                    '}',
                    '@enduml'].join(os.EOL));
    });

    it('generate PlantUML for Generics/Complex.ts', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Generics/Complex.ts'])))
            .toEqual(
                ['@startuml',
                    'interface GenericInterface<T extends string> {',
                    '    +method(arg: T): T',
                    '}',
                    'interface GenericInterface2<T extends string> {',
                    '    +property?: T',
                    '}',
                    'interface GenericInterface3<T extends string, A extends number> extends GenericInterface2 {',
                    '    +method2(arg: A): A',
                    '}',
                    'class GenericClass<T extends string, A extends number> implements GenericInterface, GenericInterface3 {',
                    '    +property?: T',
                    '    +method(arg: T): T',
                    '    +method2(arg: A): A',
                    '}',
                    'class GenericClass2<T extends string> implements GenericInterface2 {',
                    '    +property?: T',
                    '}',
                    'class ConcreteClass extends GenericClass implements GenericInterface, GenericInterface2 {',
                    '    +property: string',
                    '}',
                    'interface GenericTypes {',
                    '    +genericType: GenericClass<string, number>',
                    '    +genericType2: GenericClass2<string>',
                    '    +genericReturnType(): GenericInterface<string>',
                    '    +genericReturnType2(): GenericInterface3<string, number>',
                    '    +genericParameter(parameter: GenericInterface2<string>): void',
                    '}',
                    '@enduml'].join(os.EOL));
    });

    it('generate PlantUML for Generics/Greeter.ts', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Generics/Greeter.ts'])))
            .toEqual(
                ['@startuml',
                    'class Greeter<T> {',
                    '    +greeting: T',
                    '    +greet(): T',
                    '}',
                    '@enduml'].join(os.EOL));
    });

    it('generate PlantUML for Generics/RecursiveGenericType.ts', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Generics/RecursiveGenericType.ts'])))
            .toEqual(
                ['@startuml',
                    'interface FirstGeneric<T> {',
                    '    +index: T',
                    '}',
                    'interface SecondGeneric<T> {',
                    '    +index: T',
                    '}',
                    'interface ThirdGeneric<T> {',
                    '    +index: T',
                    '}',
                    'interface NormalInterface {',
                    '    +index: any',
                    '}',
                    'interface NormalInterface_2 {',
                    '    +index: any',
                    '}',
                    'interface RecursiveGenericType {',
                    '    +recursiveGenericType: string | number | FirstGeneric<SecondGeneric<ThirdGeneric<NormalInterface> | NormalInterface_2>>',
                    '}',
                    '@enduml'].join(os.EOL));
    });

    it('generate PlantUML for Inheritance/autos.ts', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Inheritance/autos.ts'])))
            .toEqual(
                ['@startuml',
                    'class Vehicle implements IVehicle {',
                    '    +color: string',
                    '    +start(type: string): string',
                    '}',
                    'interface IVehicle {',
                    '    +start(type: string): string',
                    '}',
                    'class Car extends Vehicle {',
                    '    +start(): string',
                    '}',
                    'interface ITrunk {',
                    '    +openTrunk(): void',
                    '}',
                    'interface IWindow {',
                    '    +openWindow(): void',
                    '}',
                    'class Sedan extends Car implements ITrunk, IWindow {',
                    '    +start(): string',
                    '    +openTrunk(): void',
                    '    +openWindow(): void',
                    '}',
                    'class Truck extends Vehicle {',
                    '    +start(): string',
                    '}',
                    '@enduml'].join(os.EOL));
    });

    it('generate PlantUML for RayTracer', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/RayTracer/index.ts'])))
            .toEqual(
                ['@startuml',
                    'class Vector {',
                    '    +x: number',
                    '    +y: number',
                    '    +z: number',
                    '    +{static} times(k: number, v: Vector): Vector',
                    '    +{static} minus(v1: Vector, v2: Vector): Vector',
                    '    +{static} plus(v1: Vector, v2: Vector): Vector',
                    '    +{static} dot(v1: Vector, v2: Vector): number',
                    '    +{static} mag(v: Vector): number',
                    '    +{static} norm(v: Vector): Vector',
                    '    +{static} cross(v1: Vector, v2: Vector): Vector',
                    '}',
                    'interface Ray {',
                    '    +start: Vector',
                    '    +dir: Vector',
                    '}',
                    'interface Intersection {',
                    '    +thing: Thing',
                    '    +ray: Ray',
                    '    +dist: number',
                    '}',
                    'class Color {',
                    '    +r: number',
                    '    +g: number',
                    '    +b: number',
                    '    +{static} scale(k: number, v: Color): Color',
                    '    +{static} plus(v1: Color, v2: Color): Color',
                    '    +{static} times(v1: Color, v2: Color): Color',
                    '    +{static} white: Color',
                    '    +{static} grey: Color',
                    '    +{static} black: Color',
                    '    +{static} background: Color',
                    '    +{static} defaultColor: Color',
                    '    +{static} toDrawingColor(c: Color): { r: number; g: number; b: number; }',
                    '}',
                    'interface Surface {',
                    '    +diffuse: (pos: Vector) => Color',
                    '    +specular: (pos: Vector) => Color',
                    '    +reflect: (pos: Vector) => number',
                    '    +roughness: number',
                    '}',
                    'interface Thing {',
                    '    +intersect: (ray: Ray) => Intersection',
                    '    +normal: (pos: Vector) => Vector',
                    '    +surface: Surface',
                    '    +destroy(): void',
                    '    +destroy(name: string): void',
                    '}',
                    'interface Light {',
                    '    +pos: Vector',
                    '    +color: Color',
                    '}',
                    'class Camera {',
                    '    +forward: Vector',
                    '    +right: Vector',
                    '    +up: Vector',
                    '    +pos: Vector',
                    '}',
                    'interface Scene {',
                    '    +things: Thing[]',
                    '    +lights: Light[]',
                    '    +camera: Camera',
                    '}',
                    'class Plane implements Thing {',
                    '    +normal: (pos: Vector) => Vector',
                    '    +intersect: (ray: Ray) => Intersection',
                    '    +surface: Surface',
                    '}',
                    'class Sphere implements Thing {',
                    '    +radius2: number',
                    '    +center: Vector',
                    '    +surface: Surface',
                    '    +normal(pos: Vector): Vector',
                    '    +intersect(ray: Ray): { thing: this; ray: Ray; dist: number; }',
                    '}',
                    'namespace Surfaces {',
                    '}',
                    'class RayTracer {',
                    '    -maxDepth: number',
                    '    -intersections(ray: Ray, scene: Scene): Intersection',
                    '    -testRay(ray: Ray, scene: Scene): number',
                    '    -traceRay(ray: Ray, scene: Scene, depth: number): Color',
                    '    -shade(isect: Intersection, scene: Scene, depth: number): Color',
                    '    -getReflectionColor(thing: Thing, pos: Vector, normal: Vector, rd: Vector, scene: Scene, depth: number): Color',
                    '    -getNaturalColor(thing: Thing, pos: Vector, norm: Vector, rd: Vector, scene: Scene): any',
                    '    +render(scene: any, ctx: any, screenWidth: any, screenHeight: any): void',
                    '}',
                    '@enduml'].join(os.EOL));
    });
});
