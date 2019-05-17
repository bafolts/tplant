
import ts from 'typescript';
import { Class } from './Class';
import * as ComponentFactory from './ComponentFactory';
import { IComponentComposite } from './IComponentComposite';

export function create(classSymbol: ts.Symbol, checker: ts.TypeChecker): IComponentComposite {
    const result: Class = new Class();
    const classDeclaration: ts.ClassDeclaration[] | undefined = <ts.ClassDeclaration[] | undefined>classSymbol.getDeclarations();

    result.name = classSymbol.getName();

    if (classDeclaration !== undefined && classDeclaration.length > 0) {
        result.isStatic = ComponentFactory.isStatic(classDeclaration[classDeclaration.length - 1]);
        result.isAbstract = ComponentFactory.isAbstract(classDeclaration[classDeclaration.length - 1]);
    }

    if (classSymbol.members !== undefined) {
        result.members = ComponentFactory.serializeMethods(classSymbol.members, checker);
        result.typeParameters = ComponentFactory.serializeTypeParameters(classSymbol.members, checker);
    }

    if (classSymbol.exports !== undefined) {
        result.members = result.members.concat(ComponentFactory.serializeMethods(classSymbol.exports, checker));
    }

    if (classSymbol.globalExports !== undefined) {
        result.members = result.members.concat(ComponentFactory.serializeMethods(classSymbol.globalExports, checker));
    }

    if (classDeclaration !== undefined && classDeclaration.length > 0) {
        const heritageClauses: ts.NodeArray<ts.HeritageClause> | undefined = classDeclaration[classDeclaration.length - 1].heritageClauses;

        if (heritageClauses !== undefined) {
            heritageClauses.forEach((heritageClause: ts.HeritageClause): void => {
                if (heritageClause.token === ts.SyntaxKind.ExtendsKeyword) {
                    result.extendsClass = ComponentFactory.getExtendsHeritageClauseName(heritageClause);
                } else if (heritageClause.token === ts.SyntaxKind.ImplementsKeyword) {
                    result.implementsInterfaces = ComponentFactory.getImplementsHeritageClauseNames(heritageClause);
                }
            });
        }
    }

    return result;
}
