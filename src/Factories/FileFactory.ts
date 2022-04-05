import ts from 'typescript';
import { File } from '../Components/File';
import { ComponentFactory } from './ComponentFactory';

export namespace FileFactory {
    export function create(sourceFile: ts.Node, checker: ts.TypeChecker): File {
        const file: File = new File(sourceFile.getName());
        file.parts = ComponentFactory.create(sourceFile, checker);

        return file;
    }
}
