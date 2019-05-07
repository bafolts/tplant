#!/usr/bin/env node

import commander from 'commander';
import { writeFile } from 'fs';
import G from 'glob';
import { convertToPlant } from './convertToPlant';
import { generateDocumentation } from './generateDocumentation';

commander
    .version('2.1.1')
    .usage('[options]')
    .option('-i, --input <path>', 'input file')
    .option('-o, --output <path>', 'output file')
    .option('-c, --compositions', 'create not heritage compositions')
    .option('-I, --only-interfaces', 'only output interfaces')
    .parse(process.argv);

if (!commander.input) {
    console.error('missing input file');
    process.exit(1);
}

G(<string>commander.input, {}, (err: Error | null, matches: string[]): void => {
    if (err !== null) {
        console.error(err);

        return;
    }

    const output: string = convertToPlant(
        generateDocumentation(matches),
        {
            compositions: <boolean>commander.compositions,
            onlyInterfaces: <boolean>commander.onlyInterfaces
        }
    );

    if (commander.output === undefined) {
        console.log(output);

        return;
    }

    writeFile(<string>commander.output, output, (errNoException: NodeJS.ErrnoException | null): void => {
        if (errNoException !== null) {
            console.error(errNoException);

            return;
        }

        console.log('The file was saved!');
    });
});
