import ts from 'typescript';
import { Class } from './components/Class';
import { Enum } from './components/Enum';
import { EnumValue } from './components/EnumValue';
import { File } from './components/File';
import * as FileFactory from './components/FileFactory';
import { IComponentComposite } from './components/IComponentComposite';
import { Interface } from './components/Interface';
import { Method } from './components/Method';
import { Parameter } from './components/Parameter';
import { Property } from './components/Property';
import { TypeParameter } from './components/TypeParameter';

export function generateDocumentation(
    fileNames: ReadonlyArray<string>,
    options: ts.CompilerOptions = ts.getDefaultCompilerOptions()
): IComponentComposite[] {

    // Build a program using the set of root file names in fileNames
    const program: ts.Program = ts.createProgram(fileNames, options);

    // Get the checker, we will use it to find more about classes
    const checker: ts.TypeChecker = program.getTypeChecker();

    const result: IComponentComposite[] = [];

    // Visit every sourceFile in the program
    program.getSourceFiles()
        .forEach((sourceFile: ts.SourceFile): void => {
            if (!sourceFile.isDeclarationFile) {
                const file: IComponentComposite | undefined = FileFactory.create(sourceFile, checker);
                if (file !== undefined) {
                    result.push(file);
                }
            }
        });

    return result;
}
