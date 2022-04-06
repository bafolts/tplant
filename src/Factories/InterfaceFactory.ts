import ts from 'typescript';
import { Interface } from '../Components/Interface';
import { ComponentFactory } from './ComponentFactory';

export namespace InterfaceFactory {
    export function create(interfaceSymbol: ts.Symbol, checker: ts.TypeChecker): Interface {
        const result: Interface = new Interface(interfaceSymbol.getName());

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
                        const extendsInterfaces: string[][] = ComponentFactory.getHeritageClauseNames(heritageClause, checker);
                        result.extendsInterface = extendsInterfaces.map((arr: string[]) => arr[0]);
                        result.extendsInterfaceFiles = extendsInterfaces.map((arr: string[]) => arr[1]);
                    }
                });
            }
        }

        return result;
    }
}
