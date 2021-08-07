import { tplant } from '../../src/tplant';
import { join } from "path";
import { readFileSync } from "fs";

describe('Parse Handbook codes (with Mermaid)', () => {

    it('generate MermaidJS for Basic Types/BasicTypes.ts', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Handbook/Basic Types/BasicTypes.ts']), {format: "mermaid", associations: false, onlyInterfaces: false}))
            .toEqual(readFileSync(join(__dirname, "results", "handbook_basictypes")).toString());
    });
});