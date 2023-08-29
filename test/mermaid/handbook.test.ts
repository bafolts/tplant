import * as tplant from '../../src/tplant';
import { join } from "path";
import { readFileSync } from "fs";

import { mermaidArguments } from "./playground.test";

describe('Parse Handbook codes (with Mermaid)', () => {

    it('generate MermaidJS for Basic Types/BasicTypes.ts', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/Handbook/Basic Types/BasicTypes.ts']), mermaidArguments))
            .toEqual(readFileSync(join(__dirname, "results", "handbook_basictypes")).toString());
    });
});
