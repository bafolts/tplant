import { tplant } from '../../src/tplant';
import { join } from "path";
import { readFileSync } from "fs";

function loadResult(name: string) {
    return readFileSync(join(__dirname, "results", `playground_${name}`)).toString();
}

export const mermaidArguments = {
    format: "mermaid",
    associations: false,
    onlyInterfaces: false,
    onlyClasses: false
}

describe('Parse Playground codes (with Mermaid)', () => {

    it('generate MermaidJS for Abstract/AbstractClass.ts', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Abstract/AbstractClass.ts']), mermaidArguments))
            .toEqual(
                loadResult("abstract")
            );
    });

    it('generate MermaidJS for Classes/Greeter.ts', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Classes/Greeter.ts']), mermaidArguments).trim())
            .toEqual(loadResult("greeter").trim());
    });

    it('generate MermaidJS for Enum/Enum.ts', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Enum/Enum.ts']), mermaidArguments))
            .toEqual(loadResult("enum"));
    });

    it('generate MermaidJS for Inheritance', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Inheritance/index.ts']), mermaidArguments))
            .toEqual(loadResult("inheritance"));
    });

    it('generate MermaidJS for Generics/Complex.ts', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Generics/Complex.ts']), mermaidArguments))
            .toEqual(loadResult("complex"));
    });

    it('generate MermaidJS for Generics/Greeter.ts', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Generics/Greeter.ts']), mermaidArguments))
            .toEqual(loadResult("generic_greeter"));
    });

    it('generate MermaidJS for Generics/RecursiveGenericType.ts', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Generics/RecursiveGenericType.ts']), mermaidArguments))
            .toEqual(loadResult("recursive_generic"));
    });

    it('generate MermaidJS for Inheritance/autos.ts', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Inheritance/autos.ts']), mermaidArguments))
            .toEqual(loadResult("autos"));
    });

    it('generate MermaidJS for Inheritance/autos.ts targeting Vehicle', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Inheritance/autos.ts']), {...mermaidArguments, targetClass: "Vehicle"}))
            .toEqual(loadResult("autos_vehicle"));
    });

    it('generate MermaidJS for Inheritance/autos.ts targeting Car', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Inheritance/autos.ts']), {...mermaidArguments, targetClass: "Car"}))
            .toEqual(loadResult("autos_car"));
    });

    it('generate MermaidJS for RayTracer', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/RayTracer/index.ts']), {...mermaidArguments, associations: true}))
            .toEqual(loadResult("raytracer"));
    });

    it('generate MermaidJS for Inheritance/autos.ts without interfaces', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Inheritance/autos.ts']), {...mermaidArguments, onlyClasses: true}))
            .toEqual(loadResult("autos_classonly"));
    });

});
