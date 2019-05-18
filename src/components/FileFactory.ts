
import ts from 'typescript';
import * as ClassFactory from './ClassFactory';
import * as ComponentFactory from './ComponentFactory';
import * as EnumFactory from './EnumFactory';
import { File } from './File';
import { IComponentComposite } from './IComponentComposite';
import * as InterfaceFactory from './InterfaceFactory';
import * as NamespaceFactory from './NamespaceFactory';

export function create(sourceFile: ts.Node, checker: ts.TypeChecker): IComponentComposite {

    const file: File = new File();

    // Walk the tree to search for classes
    ts.forEachChild(sourceFile, (node: ts.Node) => {

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
            file.parts.push(ClassFactory.create(symbol, checker));

            // No need to walk any further, class expressions/inner declarations
            // cannot be exported
        } else if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
            const currentNode: ts.InterfaceDeclaration = <ts.InterfaceDeclaration>node;
            const symbol: ts.Symbol | undefined = checker.getSymbolAtLocation(currentNode.name);
            if (symbol === undefined) {
                return;
            }
            file.parts.push(InterfaceFactory.create(symbol, checker));
        } else if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
            const currentNode: ts.NamespaceDeclaration = <ts.NamespaceDeclaration>node;
            const symbol: ts.Symbol | undefined = checker.getSymbolAtLocation(currentNode.name);
            if (symbol === undefined) {
                return;
            }
            file.parts.push(NamespaceFactory.create(symbol, checker));
        } else if (node.kind === ts.SyntaxKind.EnumDeclaration) {
            const currentNode: ts.EnumDeclaration = <ts.EnumDeclaration>node;
            const symbol: ts.Symbol | undefined = checker.getSymbolAtLocation(currentNode.name);
            if (symbol === undefined) {
                return;
            }
            file.parts.push(EnumFactory.create(symbol, checker));

            return;
        }
    });

    return file;
}
