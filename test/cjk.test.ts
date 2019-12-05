import {exec} from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import DoneCallback = jest.DoneCallback;

describe('Parse codes that contains CJK characters', () => {

    it('generate PlantUML for classes that contains CJK characters', (done: DoneCallback) => {
        // tslint:disable-next-line:max-line-length
        exec('ts-node --project ./tsconfig.json ./src/index.ts -i ./test/CJK/CJK.ts --output ./output.puml', () => {
            const fileContent: string = fs.readFileSync('./output.puml', 'utf-8');

            expect(fileContent)
                .toEqual(
                    ['@startuml',
                        'namespace CJK {',
                        '    class ChineseCharacters {',
                        '        +你好: string',
                        '    }',
                        '}',
                        '@enduml'].join(os.EOL)
                );

            done();
        });
    });
});
