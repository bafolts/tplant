import * as os from 'os';
import ts from 'typescript';
import { Class } from './Components/Class';
import { File } from './Components/File';
import { Interface } from './Components/Interface';
import { Method } from './Components/Method';
import { Parameter } from './Components/Parameter';
import { Property } from './Components/Property';
import { ComponentKind } from './Models/ComponentKind';
import { IComponentComposite } from './Models/IComponentComposite';

import { FileFactory } from './Factories/FileFactory';
import { ICommandOptions } from './Models/ICommandOptions';

const COMPOSITION_LINE: string = '*--';
const REGEX_ONLY_TYPE_NAMES: RegExp = /\w+/g;

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
        compositions: false,
        onlyInterfaces: false
    }): string {

        const lines: string[] = [];

        if (options.onlyInterfaces) {
            for (const file of files) {
                (<File>file).parts = (<File>file).parts
                    .filter((part: IComponentComposite): boolean => part.componentKind === ComponentKind.INTERFACE);
            }
        }

        lines.push('@startuml');

        files.forEach((file: IComponentComposite): void => {
            const conversion: string = file.toPUML();
            if (conversion !== '') {
                lines.push(conversion);
            }
        });

        if (options.compositions) {
            lines.push(...createCompositions(files));
        }

        lines.push('@enduml');

        return lines.join(os.EOL);
    }

    function createCompositions(files: IComponentComposite[]): string[] {
        const compositions: string[] = [];

        const mappedTypes: { [x: string]: boolean } = {};
        const outputConstraints: { [x: string]: boolean } = {};
        files.forEach((file: IComponentComposite): void => {
            (<File>file).parts.forEach((part: IComponentComposite): void => {
                if (part.componentKind === ComponentKind.CLASS ||
                    part.componentKind === ComponentKind.INTERFACE ||
                    part.componentKind === ComponentKind.ENUM
                ) {
                    mappedTypes[part.name] = true;
                }
            });
        });
        files.forEach((file: IComponentComposite): void => {
            if (file.componentKind !== ComponentKind.FILE) {
                return;
            }

            (<File>file).parts.forEach((part: IComponentComposite): void => {
                if (!(part instanceof Class) && !(part instanceof Interface)) {
                    return;
                }

                part.members.forEach((member: IComponentComposite): void => {
                    let checks: string[] = [];

                    if (member instanceof Method) {
                        member.parameters.forEach((parameter: IComponentComposite): void => {
                            const parameters: string[] | null = (<Parameter>parameter).parameterType.match(REGEX_ONLY_TYPE_NAMES);
                            if (parameters !== null) {
                                checks = checks.concat(parameters);
                            }
                        });
                    }

                    const returnTypes: string[] | null = (<Method | Property>member).returnType.match(REGEX_ONLY_TYPE_NAMES);
                    if (returnTypes !== null) {
                        checks = checks.concat(returnTypes);
                    }

                    for (const allTypeName of checks) {
                        const key: string = `${part.name} ${COMPOSITION_LINE} ${allTypeName}`;
                        if (allTypeName !== part.name &&
                            !outputConstraints.hasOwnProperty(key) && mappedTypes.hasOwnProperty(allTypeName)) {
                            compositions.push(key);
                            outputConstraints[key] = true;
                        }
                    }

                });
            });
        });

        return compositions;
    }
}
