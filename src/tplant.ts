import ts from 'typescript';
import { File } from './Components/File';
import { PlantUMLFormat } from './Formatter/PlantUMLFormat';
import { ComponentKind } from './Models/ComponentKind';
import { Formatter } from './Models/Formatter';
import { IComponentComposite } from './Models/IComponentComposite';

import { Class } from './Components/Class';
import * as FileFactory from './Factories/FileFactory';
import { MermaidFormat } from './Formatter/MermaidFormat';
import { ICommandOptions } from './Models/ICommandOptions';

const DEFAULT_FILE_NAME = 'source.ts';

export function generateDocumentation(
    fileNames: ReadonlyArray<string> | string,
    options: ts.CompilerOptions = ts.getDefaultCompilerOptions()
): IComponentComposite[] {

    // Build a program using the set of root file names in fileNames
    let program: ts.Program;

    if (Array.isArray(fileNames)) {
        program = ts.createProgram(fileNames, options);
    } else {
        program = ts.createProgram({
            rootNames: [DEFAULT_FILE_NAME],
            options,
            host: getCompilerHostForSource(fileNames as string)
        });
    }

    // Get the checker, we will use it to find more about classes
    const checker: ts.TypeChecker = program.getTypeChecker();

    const result: IComponentComposite[] = [];

    // Visit every sourceFile in the program
    program.getSourceFiles()
        .forEach((sourceFile: ts.SourceFile): void => {
            if (!sourceFile.isDeclarationFile) {
                const file: IComponentComposite | undefined = FileFactory.create(sourceFile.fileName, sourceFile, checker);
                if (file !== undefined) {
                    result.push(file);
                }
            }
        });

    return result;
}

function getCompilerHostForSource(source: string): ts.CompilerHost {
    const sourceFile = ts.createSourceFile(DEFAULT_FILE_NAME, source, ts.ScriptTarget.ES2016);
    return {
        getSourceFile: () => sourceFile,
        getDefaultLibFileName: () => "",
        writeFile: () => undefined,
        getCurrentDirectory: () => "",
        getCanonicalFileName: () => DEFAULT_FILE_NAME,
        useCaseSensitiveFileNames: () => false,
        getNewLine: () => "\n",
        fileExists: () => true,
        readFile: () => {
            throw new Error("NOT IMPLEMENTED");
        }
    }
}

export function convertToPlant(files: IComponentComposite[], options: ICommandOptions = {
    associations: false,
    onlyInterfaces: false,
    format: 'plantuml',
    onlyClasses: false
}): string {

    let formatter : Formatter;
    if (options.format === 'mermaid') {
        formatter = new MermaidFormat(options);
    } else {
        formatter = new PlantUMLFormat(options);
    }

    // Only display interfaces
    if (options.onlyClasses) {
        for (const file of files) {
            (<File>file).parts = (<File>file).parts
                .filter((part: IComponentComposite): boolean => part.componentKind === ComponentKind.CLASS);
        }
    } else if (options.onlyInterfaces) {
        for (const file of files) {
            (<File>file).parts = (<File>file).parts
                .filter((part: IComponentComposite): boolean => part.componentKind === ComponentKind.INTERFACE);
        }
    } else if (options.targetClass !== undefined) {
        // Find the class to display
        const target : Class = <Class> findClass(files, options.targetClass);
        const parts : IComponentComposite[] = [];
        if (target !== undefined) {
            parts.push(target);
            // Add all the ancestor for the class recursively
            let parent : string | undefined = target.extendsClass;
            // Add the parent
            while (parent !== undefined) {
                const parentClass : Class = <Class> findClass(files, parent);
                parts.push(parentClass);
                parts.push(...getInterfaces(files, parentClass));
                parent = parentClass.extendsClass;
            }
            // Add all the interface
            parts.push(...getInterfaces(files, target));
            // Add all child class recursively
            parts.push(...findChildClass(files, target));
        }

        return formatter.renderFiles(parts, false);
    }

    return formatter.renderFiles(files, options.associations);
}

function getInterfaces(files:  IComponentComposite[], comp: Class) : IComponentComposite[] {
    const res: IComponentComposite[] = [];
    comp.implementsInterfaces.forEach((impl: string) => {
        const implComponent : IComponentComposite | undefined = findClass(files, impl);
        if (implComponent !== undefined) {
            res.push(implComponent);
        }
    });

    return res;
}

function findClass(files: IComponentComposite[], name: string) : IComponentComposite | undefined {
    for (const file of files) {
        for (const part of (<File>file).parts) {
            if (part.name === name) {
                return part;
            }
        }
    }

    return undefined;
}

function findChildClass(files: IComponentComposite[], comp: IComponentComposite) : IComponentComposite[] {
    const res: IComponentComposite[] = [];
    for (const file of files) {
        (<File>file).parts
            .forEach((part: IComponentComposite): void => {
                if (part instanceof Class && (part).extendsClass === comp.name) {
                    res.push(part);
                    // Reset interface
                    part.implementsInterfaces = [];
                    res.push(...findChildClass(files, part));
                }
            });
    }

    return res;
}
