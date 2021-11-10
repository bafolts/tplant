import ts from 'typescript';
import { Method } from '../Components/Method';
import { Property } from '../Components/Property';
import { TypeParameter } from '../Components/TypeParameter';
import { IComponentComposite } from '../Models/IComponentComposite';
import { Modifier } from '../Models/Modifier';
import { ClassFactory } from './ClassFactory';
import { EnumFactory } from './EnumFactory';
import { InterfaceFactory } from './InterfaceFactory';
import { MethodFactory } from './MethodFactory';
import { NamespaceFactory } from './NamespaceFactory';
import { PropertyFactory } from './PropertyFactory';
import { TypeParameterFactory } from './TypeParameterFactory';

export namespace ComponentFactory {
    export function isNodeExported(node: ts.Node): boolean {
        // tslint:disable-next-line no-bitwise
        return (node.flags & ts.ModifierFlags.Export) !== 0 ||
            node.parent.kind === ts.SyntaxKind.SourceFile ||
            node.parent.kind === ts.SyntaxKind.ModuleBlock;
    }

    export function create(node: ts.Node, checker: ts.TypeChecker): IComponentComposite[] {
        const componentComposites: IComponentComposite[] = [];

        ts.forEachChild(node, (childNode: ts.Node) => {

            // Only consider exported nodes
            if (!isNodeExported(childNode)) {
                return;
            }

            if (childNode.kind === ts.SyntaxKind.ClassDeclaration) {
                const currentNode: ts.ClassLikeDeclarationBase = <ts.ClassLikeDeclarationBase>childNode;
                if (currentNode.name === undefined) {
                    return;
                }
                // This is a top level class, get its symbol
                const classSymbol: ts.Symbol | undefined = checker.getSymbolAtLocation(currentNode.name);
                if (classSymbol === undefined) {
                    return;
                }
                componentComposites.push(ClassFactory.create(classSymbol, checker));

                // No need to walk any further, class expressions/inner declarations
                // cannot be exported
            } else if (childNode.kind === ts.SyntaxKind.InterfaceDeclaration) {
                const currentNode: ts.InterfaceDeclaration = <ts.InterfaceDeclaration>childNode;
                const interfaceSymbol: ts.Symbol | undefined = checker.getSymbolAtLocation(currentNode.name);
                if (interfaceSymbol === undefined) {
                    return;
                }
                componentComposites.push(InterfaceFactory.create(interfaceSymbol, checker));
            } else if (childNode.kind === ts.SyntaxKind.ModuleDeclaration) {
                const currentNode: ts.NamespaceDeclaration = <ts.NamespaceDeclaration>childNode;
                const namespaceSymbol: ts.Symbol | undefined = checker.getSymbolAtLocation(currentNode.name);
                if (namespaceSymbol === undefined) {
                    return;
                }
                componentComposites.push(NamespaceFactory.create(namespaceSymbol, checker));
            } else if (childNode.kind === ts.SyntaxKind.EnumDeclaration) {
                const currentNode: ts.EnumDeclaration = <ts.EnumDeclaration>childNode;
                const enumSymbol: ts.Symbol | undefined = checker.getSymbolAtLocation(currentNode.name);
                if (enumSymbol === undefined) {
                    return;
                }
                componentComposites.push(EnumFactory.create(enumSymbol));

                return;
            }
        });

        return componentComposites;
    }

    function getModifier(modifiers: ts.NodeArray<ts.Modifier>): Modifier {
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

    export function getHeritageClauseNames(heritageClause: ts.HeritageClause, checker: ts.TypeChecker): string[] {
        return heritageClause.types.map((nodeObject: ts.ExpressionWithTypeArguments) => {
            const symbolAtLocation: ts.Symbol | undefined = checker.getSymbolAtLocation(nodeObject.expression);
            if (symbolAtLocation !== undefined) {
                return checker.getFullyQualifiedName(symbolAtLocation);
            }

            return '';
        });
    }

    function isMethod(declaration: ts.NamedDeclaration): boolean {
        return declaration.kind === ts.SyntaxKind.MethodDeclaration ||
            declaration.kind === ts.SyntaxKind.MethodSignature;
    }

    function isProperty(declaration: ts.NamedDeclaration): boolean {
        return declaration.kind === ts.SyntaxKind.PropertySignature ||
            declaration.kind === ts.SyntaxKind.PropertyDeclaration ||
            declaration.kind === ts.SyntaxKind.GetAccessor ||
            declaration.kind === ts.SyntaxKind.SetAccessor ||
            declaration.kind === ts.SyntaxKind.Parameter;
    }

    function isTypeParameter(declaration: ts.NamedDeclaration): boolean {
        return declaration.kind === ts.SyntaxKind.TypeParameter;
    }

    export function getMemberModifier(memberDeclaration: ts.Declaration): Modifier {
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

    export function isOptional(declaration: ts.PropertyDeclaration | ts.ParameterDeclaration | ts.MethodDeclaration): boolean {
        return declaration.questionToken !== undefined;
    }
}
