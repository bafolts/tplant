import ts from 'typescript';
import { Class } from '../Components/Class';
import { ComponentFactory } from './ComponentFactory';

export namespace ClassFactory {
    export function create(classSymbol: ts.Symbol, checker: ts.TypeChecker): Class {
        const result: Class = new Class(classSymbol.getName());
        const classDeclaration: ts.ClassDeclaration[] | undefined = <ts.ClassDeclaration[] | undefined>classSymbol.getDeclarations();

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
            const heritageClauses: ts.NodeArray<ts.HeritageClause> | undefined =
                classDeclaration[classDeclaration.length - 1].heritageClauses;

            if (heritageClauses !== undefined) {
                heritageClauses.forEach((heritageClause: ts.HeritageClause): void => {
                    if (heritageClause.token === ts.SyntaxKind.ExtendsKeyword) {
                        result.extendsClass = ComponentFactory.getHeritageClauseNames(heritageClause, checker)[0];
                    } else if (heritageClause.token === ts.SyntaxKind.ImplementsKeyword) {
                        result.implementsInterfaces = ComponentFactory.getHeritageClauseNames(heritageClause, checker);
                    }
                });
            }
        }

        return result;
    }
}
