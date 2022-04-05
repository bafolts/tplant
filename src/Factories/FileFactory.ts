import ts from 'typescript';
import { File } from '../Components/File';
import { ComponentFactory } from './ComponentFactory';

export namespace FileFactory {
    export function create(sourceFile: ts.SourceFile, checker: ts.TypeChecker): File {
        const file: File = new File(sourceFile.fileName);
        file.parts = ComponentFactory.create(sourceFile, checker);

        return file;
    }
}
