const assert = require('assert');
const os = require('os');
const generateDocumentation = require("../dist/generateDocumentation");
const convertToPlant = require("../dist/convertToPlant");

describe("Test commander options", () => {

    it('generate PlantUML with only Interfaces for Inheritance/autos.ts', () => {
        assert.equal(convertToPlant.convertToPlant(generateDocumentation.generateDocumentation(["sample/Inheritance/autos.ts"]), { compositions: false, onlyInterfaces: true }),
            ['@startuml',
                'interface IVehicle {',
                '    +start(type: string): string',
                '}',
                'interface ITrunk {',
                '    +openTrunk(): void',
                '}',
                'interface IWindow {',
                '    +openWindow(): void',
                '}',
                '@enduml'].join(os.EOL));
    });

    it("generate PlantUML for RayTracer with compositions", () => {
        assert.equal(convertToPlant.convertToPlant(generateDocumentation.generateDocumentation(["sample/RayTracer/index.ts"]), { compositions: true, onlyInterfaces: false }),
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
                'Ray *-- Vector',
                'Intersection *-- Thing',
                'Intersection *-- Ray',
                'Surface *-- Vector',
                'Surface *-- Color',
                'Thing *-- Ray',
                'Thing *-- Intersection',
                'Thing *-- Vector',
                'Thing *-- Surface',
                'Light *-- Vector',
                'Light *-- Color',
                'Camera *-- Vector',
                'Scene *-- Thing',
                'Scene *-- Light',
                'Scene *-- Camera',
                'Plane *-- Vector',
                'Plane *-- Ray',
                'Plane *-- Intersection',
                'Plane *-- Surface',
                'Sphere *-- Vector',
                'Sphere *-- Surface',
                'Sphere *-- Ray',
                'RayTracer *-- Ray',
                'RayTracer *-- Scene',
                'RayTracer *-- Intersection',
                'RayTracer *-- Color',
                'RayTracer *-- Thing',
                'RayTracer *-- Vector',
                '@enduml'].join(os.EOL));
    });

    it('generate PlantUML for Generics/Complex.ts with compositions', () => {
        assert.equal(convertToPlant.convertToPlant(generateDocumentation.generateDocumentation(["sample/Generics/Complex.ts"]), { compositions: true, onlyInterfaces: false }),
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
                'GenericTypes *-- GenericClass',
                'GenericTypes *-- GenericClass2',
                'GenericTypes *-- GenericInterface',
                'GenericTypes *-- GenericInterface3',
                'GenericTypes *-- GenericInterface2',
                '@enduml'].join(os.EOL));
    });

    it('generate PlantUML for Generics/RecursiveGenericType.ts with compositions', () => {
        assert.equal(convertToPlant.convertToPlant(generateDocumentation.generateDocumentation(["sample/Generics/RecursiveGenericType.ts"]), { compositions: true, onlyInterfaces: false }),
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
                'RecursiveGenericType *-- FirstGeneric',
                'RecursiveGenericType *-- SecondGeneric',
                'RecursiveGenericType *-- ThirdGeneric',
                'RecursiveGenericType *-- NormalInterface',
                'RecursiveGenericType *-- NormalInterface_2',
                '@enduml'].join(os.EOL));
    });

    it("generate PlantUML for RayTracer with compositions and only Interfaces", () => {
        assert.equal(convertToPlant.convertToPlant(generateDocumentation.generateDocumentation(["sample/RayTracer/index.ts"]), { compositions: true, onlyInterfaces: true }),
            ['@startuml',
                'interface Ray {',
                '    +start: Vector',
                '    +dir: Vector',
                '}',
                'interface Intersection {',
                '    +thing: Thing',
                '    +ray: Ray',
                '    +dist: number',
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
                'interface Scene {',
                '    +things: Thing[]',
                '    +lights: Light[]',
                '    +camera: Camera',
                '}',
                'Intersection *-- Thing',
                'Intersection *-- Ray',
                'Thing *-- Ray',
                'Thing *-- Intersection',
                'Thing *-- Surface',
                'Scene *-- Thing',
                'Scene *-- Light',
                '@enduml'].join(os.EOL));
    });
});
