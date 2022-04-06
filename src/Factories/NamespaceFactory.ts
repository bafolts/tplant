import ts from 'typescript';
import { Namespace } from '../Components/Namespace';
import { ComponentFactory } from './ComponentFactory';

export namespace NamespaceFactory {
    export function create(fileName: string, namespaceSymbol: ts.Symbol, checker: ts.TypeChecker): Namespace {
        const result: Namespace = new Namespace(namespaceSymbol.getName());
        const namespaceDeclarations: ts.NamespaceDeclaration[] | undefined =
            <ts.NamespaceDeclaration[] | undefined>namespaceSymbol.getDeclarations();

        if (namespaceDeclarations === undefined) {
            return result;
        }

        const declaration: ts.NamespaceDeclaration | undefined = namespaceDeclarations[namespaceDeclarations.length - 1];

        if (declaration === undefined || declaration.body === undefined) {
            return result;
        }

        if (declaration.body.kind === ts.SyntaxKind.ModuleDeclaration) {
            const childSymbol: ts.Symbol | undefined = checker.getSymbolAtLocation(declaration.body.name);
            if (childSymbol !== undefined) {
                result.parts = [create(fileName, childSymbol, checker)];

                return result;
            }
        }

        if ((<ts.ModuleBlock>declaration.body).statements === undefined) {
            return result;
        }

        result.parts = ComponentFactory.create(fileName, declaration.body, checker);

        return result;
    }
}
