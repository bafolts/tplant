import { tplant } from '../../src/tplant';
import { join } from "path";
import { readFileSync } from "fs";

function loadResult(name: string) {
    return readFileSync(join(__dirname, "results", `playground_${name}`)).toString();
}

describe('Parse Playground codes (with Mermaid)', () => {

    it('generate MermaidJS for Abstract/AbstractClass.ts', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Abstract/AbstractClass.ts']), {format: "mermaid", associations: false, onlyInterfaces: false}))
            .toEqual(
                loadResult("abstract")
            );
    });

    it('generate MermaidJS for Classes/Greeter.ts', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Classes/Greeter.ts']), {format: "mermaid", associations: false, onlyInterfaces: false}))
            .toEqual(loadResult("greeter"));
    });

    it('generate MermaidJS for Enum/Enum.ts', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Enum/Enum.ts']), {format: "mermaid", associations: false, onlyInterfaces: false}))
            .toEqual(loadResult("enum"));
    });

    it('generate MermaidJS for Inheritance', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Inheritance/index.ts']), {format: "mermaid", associations: false, onlyInterfaces: false}))
            .toEqual(loadResult("inheritance"));
    });

    it('generate MermaidJS for Generics/Complex.ts', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Generics/Complex.ts']), {format: "mermaid", associations: false, onlyInterfaces: false}))
            .toEqual(loadResult("complex"));
    });

    it('generate MermaidJS for Generics/Greeter.ts', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Generics/Greeter.ts']), {format: "mermaid", associations: false, onlyInterfaces: false}))
            .toEqual(loadResult("generic_greeter"));
    });

    it('generate MermaidJS for Generics/RecursiveGenericType.ts', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Generics/RecursiveGenericType.ts']), {format: "mermaid", associations: false, onlyInterfaces: false}))
            .toEqual(loadResult("recursive_generic"));
    });

    it('generate MermaidJS for Inheritance/autos.ts', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/Inheritance/autos.ts']), {format: "mermaid", associations: false, onlyInterfaces: false}))
            .toEqual(loadResult("autos"));
    });

    it('generate MermaidJS for RayTracer', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Playground/RayTracer/index.ts']), {format: "mermaid", associations: true, onlyInterfaces: false}))
            .toEqual(loadResult("raytracer"));
    });
});
