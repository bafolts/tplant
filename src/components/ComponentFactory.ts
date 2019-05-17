
import ts from 'typescript';
import { Method } from './Method';
import * as MethodFactory from './MethodFactory';
import { Modifier } from './Modifier';
import { Property } from './Property';
import * as PropertyFactory from './PropertyFactory';
import { TypeParameter } from './TypeParameter';
import * as TypeParameterFactory from './TypeParameterFactory';

interface IMightBeOptional {
    questionToken?: ts.Token<ts.SyntaxKind.QuestionToken>;
}

export function isNodeExported(node: ts.Node): boolean {

    // tslint:disable-next-line no-bitwise
    return (node.flags & ts.ModifierFlags.Export) !== 0 ||
        node.parent.kind === ts.SyntaxKind.SourceFile ||
        node.parent.kind === ts.SyntaxKind.ModuleBlock;
}

export function getModifier(modifiers: ts.NodeArray<ts.Modifier>): Modifier {
    for (const modifier of modifiers) {
        if (modifier.kind === ts.SyntaxKind.PrivateKeyword) {
            return 'private';
        }
        if (modifier.kind === ts.SyntaxKind.PublicKeyword) {
            return 'public';
        }
        if (modifier.kind === ts.SyntaxKind.ProtectedKeyword) {
            return 'protected';
        }
    }

    return 'public';
}

export function getExtendsHeritageClauseName(heritageClause: ts.HeritageClause): string {
    return (<ts.Identifier>heritageClause.types[0].expression).text;
}

export function getInterfaceName(nodeObject: ts.ExpressionWithTypeArguments): string {
    return (<ts.Identifier>nodeObject.expression).text;
}

export function getImplementsHeritageClauseNames(heritageClause: ts.HeritageClause): string[] {
    return heritageClause.types.map(getInterfaceName);
}

export function isMethod(declaration: ts.NamedDeclaration): boolean {
    return declaration.kind === ts.SyntaxKind.MethodDeclaration ||
           declaration.kind === ts.SyntaxKind.MethodSignature;
}

export function isProperty(declaration: ts.NamedDeclaration): boolean {
    return declaration.kind === ts.SyntaxKind.PropertySignature ||
           declaration.kind === ts.SyntaxKind.PropertyDeclaration ||
           declaration.kind === ts.SyntaxKind.GetAccessor ||
           declaration.kind === ts.SyntaxKind.SetAccessor ||
           declaration.kind === ts.SyntaxKind.Parameter;
}

export function isTypeParameter(declaration: ts.NamedDeclaration): boolean {
    return declaration.kind === ts.SyntaxKind.TypeParameter;
}

export function getMemberModifier(memberDeclaration: ts.Declaration): 'public' | 'private' | 'protected' {
    const memberModifiers: ts.NodeArray<ts.Modifier> | undefined = memberDeclaration.modifiers;

    if (memberModifiers === undefined) {
        return 'public';
    }

    return getModifier(memberModifiers);
}

export function isAbstract(memberDeclaration: ts.Declaration): boolean {

    const memberModifiers: ts.NodeArray<ts.Modifier> | undefined = memberDeclaration.modifiers;

    if (memberModifiers !== undefined) {
        for (const memberModifier of memberModifiers) {
            if (memberModifier.kind === ts.SyntaxKind.AbstractKeyword) {
                return true;
            }
        }
    }

    return false;
}

export function isStatic(memberDeclaration: ts.Declaration): boolean {
    const memberModifiers: ts.NodeArray<ts.Modifier> | undefined = memberDeclaration.modifiers;

    if (memberModifiers !== undefined) {
        for (const memberModifier of memberModifiers) {
            if (memberModifier.kind === ts.SyntaxKind.StaticKeyword) {
                return true;
            }
        }
    }

    return false;
}

export function serializeMethods(memberSymbols: ts.UnderscoreEscapedMap<ts.Symbol>, checker: ts.TypeChecker): (Property | Method)[] {
    const result: (Property | Method)[] = [];

    if (memberSymbols !== undefined) {
        memberSymbols.forEach((memberSymbol: ts.Symbol): void => {
            const memberDeclarations: ts.NamedDeclaration[] | undefined = memberSymbol.getDeclarations();
            if (memberDeclarations === undefined) {
                return;
            }
            memberDeclarations.forEach((memberDeclaration: ts.NamedDeclaration): void => {
                if (isMethod(memberDeclaration)) {
                    result.push(MethodFactory.create(memberSymbol, memberDeclaration, checker));
                } else if (isProperty(memberDeclaration)) {
                    result.push(PropertyFactory.create(memberSymbol, memberDeclaration, checker));
                }
            });
        });
    }

    return result;
}

export function serializeTypeParameters(memberSymbols: ts.UnderscoreEscapedMap<ts.Symbol>, checker: ts.TypeChecker): TypeParameter[] {
    const result: TypeParameter[] = [];

    if (memberSymbols !== undefined) {
        memberSymbols.forEach((memberSymbol: ts.Symbol): void => {
            const memberDeclarations: ts.NamedDeclaration[] | undefined = memberSymbol.getDeclarations();
            if (memberDeclarations === undefined) {
                return;
            }
            memberDeclarations.forEach((memberDeclaration: ts.NamedDeclaration): void => {
                if (isTypeParameter(memberDeclaration)) {
                    result.push(TypeParameterFactory.create(memberSymbol, memberDeclaration, checker));
                }
            });
        });
    }

    return result;
}

export function hasInitializer(declaration: ts.ParameterDeclaration): boolean {
    return declaration.initializer !== undefined;
}

export function isOptional(declaration: IMightBeOptional): boolean {
    return declaration.questionToken !== undefined;
}
