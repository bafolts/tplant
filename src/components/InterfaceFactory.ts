
import ts from 'typescript';
import * as ComponentFactory from './ComponentFactory';
import { IComponentComposite } from './IComponentComposite';
import { Interface } from './Interface';

export function create(interfaceSymbol: ts.Symbol, checker: ts.TypeChecker): IComponentComposite {
    const result: Interface = new Interface();
    result.name = interfaceSymbol.getName();

    const declaration: ts.InterfaceDeclaration[] | undefined = <ts.InterfaceDeclaration[] | undefined>interfaceSymbol.getDeclarations();

    if (interfaceSymbol.members !== undefined) {
        result.members = ComponentFactory.serializeMethods(interfaceSymbol.members, checker);
        result.typeParameters = ComponentFactory.serializeTypeParameters(interfaceSymbol.members, checker);
    }

    if (declaration !== undefined && declaration.length > 0) {
        const heritageClauses: ts.NodeArray<ts.HeritageClause> | undefined = declaration[declaration.length - 1].heritageClauses;
        if (heritageClauses !== undefined) {
            heritageClauses.forEach((heritageClause: ts.HeritageClause): void => {
                if (heritageClause.token === ts.SyntaxKind.ExtendsKeyword) {
                    result.extends = [ComponentFactory.getExtendsHeritageClauseName(heritageClause)];
                }
            });
        }
    }

    return result;
}
