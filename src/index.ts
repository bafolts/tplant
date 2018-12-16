#!/usr/bin/env node

import commander from 'commander';
import glob from "glob";
import convertToPlant from "./convertToPlant";
import generateDocumentation from "./generateDocumentation";

commander
    .version("1.1.0")
    .usage("[options]")
    .option('-i, --input [string]', 'input file')
    .parse(process.argv);

if (!commander.input) {
    console.error("missing input file");
    process.exit(1);
}

glob(commander.input, {}, function (err: Error | null, matches: string[]) {
    console.log(convertToPlant(generateDocumentation(matches)));
});
