import ts from 'typescript';
import { File } from './Components/File';
import { PlantUMLFormat } from './Formatter/PlantUMLFormat';
import { ComponentKind } from './Models/ComponentKind';
import { Formatter } from './Models/Formatter';
import { IComponentComposite } from './Models/IComponentComposite';

import { FileFactory } from './Factories/FileFactory';
import { MermaidFormat } from './Formatter/MermaidFormat';
import { ICommandOptions } from './Models/ICommandOptions';

export namespace tplant {

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

    export function convertToPlant(files: IComponentComposite[], options: ICommandOptions = {
        associations: false,
        onlyInterfaces: false,
        format: 'plantuml'
    }): string {

        if (options.onlyInterfaces) {
            for (const file of files) {
                (<File>file).parts = (<File>file).parts
                    .filter((part: IComponentComposite): boolean => part.componentKind === ComponentKind.INTERFACE);
            }
        }

        let formatter : Formatter;
        if (options.format === 'mermaid') {
            formatter = new MermaidFormat();
        } else {
            formatter = new PlantUMLFormat();
        }

        return formatter.renderFiles(files, options.associations);
    }
}
