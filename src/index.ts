#!/usr/bin/env node

import commander from 'commander';
import G from 'glob';
import { convertToPlant } from './convertToPlant';
import { generateDocumentation } from './generateDocumentation';

commander
    .version('1.1.0')
    .usage('[options]')
    .option('-i, --input [string]', 'input file')
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
    console.log(convertToPlant(generateDocumentation(matches)));
});
