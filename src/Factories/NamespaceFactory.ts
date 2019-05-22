import ts from 'typescript';
import { Namespace } from '../Components/Namespace';
import { ComponentFactory } from './ComponentFactory';

export namespace NamespaceFactory {
    export function create(namespaceSymbol: ts.Symbol, checker: ts.TypeChecker): Namespace {
        const result: Namespace = new Namespace(namespaceSymbol.getName());
        const namespaceDeclarations: ts.NamespaceDeclaration[] | undefined =
            <ts.NamespaceDeclaration[] | undefined>namespaceSymbol.getDeclarations();

        if (namespaceDeclarations === undefined) {
            return result;
        }

        const declaration: ts.NamespaceDeclaration | undefined = namespaceDeclarations[namespaceDeclarations.length - 1];

        if (declaration === undefined || (<ts.ModuleBlock>declaration.body).statements === undefined) {
            return result;
        }

        result.parts = ComponentFactory.create(declaration.body, checker);

        return result;
    }
}
