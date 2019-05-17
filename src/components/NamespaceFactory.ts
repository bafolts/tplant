
import ts from 'typescript';
import * as ClassFactory from './ClassFactory';
import * as ComponentFactory from './ComponentFactory';
import * as EnumFactory from './EnumFactory';
import { IComponentComposite } from './IComponentComposite';
import * as InterfaceFactory from './InterfaceFactory';
import { Namespace } from './Namespace';
import * as NamespaceFactory from './NamespaceFactory';

export function create(namespaceSymbol: ts.Symbol, checker: ts.TypeChecker): IComponentComposite {
    const result: Namespace = new Namespace();
    const namespaceDeclarations: ts.NamespaceDeclaration[] | undefined =
        <ts.NamespaceDeclaration[] | undefined>namespaceSymbol.getDeclarations();

    result.name = namespaceSymbol.getName();

    if (namespaceDeclarations === undefined) {
        return result;
    }

    const declaration: ts.NamespaceDeclaration | undefined = namespaceDeclarations[namespaceDeclarations.length - 1];

    if (declaration !== undefined && (<ts.ModuleBlock>declaration.body).statements !== undefined) {
        ts.forEachChild(declaration.body, (node: ts.Node) => {

            // Only consider exported nodes
            if (!ComponentFactory.isNodeExported(node)) {
                return;
            }

            if (node.kind === ts.SyntaxKind.ClassDeclaration) {
                const currentNode: ts.ClassLikeDeclarationBase = <ts.ClassLikeDeclarationBase>node;
                if (currentNode.name === undefined) {
                    return;
                }
                // This is a top level class, get its symbol
                const symbol: ts.Symbol | undefined = checker.getSymbolAtLocation(currentNode.name);
                if (symbol === undefined) {
                    return;
                }
                result.parts.push(ClassFactory.create(symbol, checker));

                // No need to walk any further, class expressions/inner declarations
                // cannot be exported
            } else if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
                const currentNode: ts.InterfaceDeclaration = <ts.InterfaceDeclaration>node;
                const symbol: ts.Symbol | undefined = checker.getSymbolAtLocation(currentNode.name);
                if (symbol === undefined) {
                    return;
                }
                result.parts.push(InterfaceFactory.create(symbol, checker));
            } else if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
                const currentNode: ts.NamespaceDeclaration = <ts.NamespaceDeclaration>node;
                const symbol: ts.Symbol | undefined = checker.getSymbolAtLocation(currentNode.name);
                if (symbol === undefined) {
                    return;
                }
                result.parts.push(NamespaceFactory.create(symbol, checker));
            } else if (node.kind === ts.SyntaxKind.EnumDeclaration) {
                const currentNode: ts.EnumDeclaration = <ts.EnumDeclaration>node;
                const symbol: ts.Symbol | undefined = checker.getSymbolAtLocation(currentNode.name);
                if (symbol === undefined) {
                    return;
                }
                result.parts.push(EnumFactory.create(symbol, checker));
            } else {
                console.warn('Unsupported namespace kind', node.kind);
            }
        });
    }

    return result;
}
