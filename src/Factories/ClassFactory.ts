import ts from 'typescript';
import { Class } from '../Components/Class';
import { ComponentFactory } from './ComponentFactory';

export namespace ClassFactory {
    export function create(fileName: string, classSymbol: ts.Symbol, checker: ts.TypeChecker): Class {
        const result: Class = new Class(classSymbol.getName(), fileName);
        const classDeclaration: ts.ClassDeclaration[] | undefined = <ts.ClassDeclaration[] | undefined>classSymbol.getDeclarations();

        if (classDeclaration !== undefined && classDeclaration.length > 0) {
            result.isStatic = ComponentFactory.isModifier(classDeclaration[classDeclaration.length - 1], ts.SyntaxKind.StaticKeyword);
            result.isAbstract = ComponentFactory.isModifier(classDeclaration[classDeclaration.length - 1], ts.SyntaxKind.AbstractKeyword);
        }

        if (classSymbol.members !== undefined) {
            result.constructorMethods = ComponentFactory.serializeConstructors(classSymbol.members, checker);
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
                        const extendsClass: string[] = ComponentFactory.getHeritageClauseNames(heritageClause, checker)[0];
                        result.extendsClass = extendsClass[0];
                        result.extendsClassFile = extendsClass[1];
                    } else if (heritageClause.token === ts.SyntaxKind.ImplementsKeyword) {
                        const implementsInterfaces: string[][] = ComponentFactory.getHeritageClauseNames(heritageClause, checker);
                        result.implementsInterfaces = implementsInterfaces.map((arr: string[]) => arr[0]);
                        result.implementsInterfacesFiles = implementsInterfaces.map((arr: string[]) => arr[1]);
                    }
                });
            }
        }

        return result;
    }
}
