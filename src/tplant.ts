import ts from 'typescript';
import { File } from './Components/File';
import { PlantUMLFormat } from './Formatter/PlantUMLFormat';
import { ComponentKind } from './Models/ComponentKind';
import { Formatter } from './Models/Formatter';
import { IComponentComposite } from './Models/IComponentComposite';

import { Class } from './Components/Class';
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
}
