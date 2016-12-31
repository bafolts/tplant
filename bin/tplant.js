#!/usr/bin/env node

var program = require("commander");
var convertToPlant = require("../src/convertToPlant");
var typescriptToMeta = require("../src/typescriptToMeta");

program
    .version("1.0.4")
    .usage("[options]")
    .option('-i, --input [string]', 'input file')
    .parse(process.argv);

if (!program.input) {
    console.error("missing input file");
    process.exit(1);
}

console.log(convertToPlant(
    typescriptToMeta(program.input)
));

