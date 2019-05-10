import ts from 'typescript';
import { Class } from './components/Class';
import { Enum } from './components/Enum';
import { EnumValue } from './components/EnumValue';
import { File } from './components/File';
import { Interface } from './components/Interface';
import { Method } from './components/Method';
import { Parameter } from './components/Parameter';
import { Property } from './components/Property';
import { TypeParameter } from './components/TypeParameter';

export function generateDocumentation(
    fileNames: ReadonlyArray<string>,
    options: ts.CompilerOptions = ts.getDefaultCompilerOptions()
): File[] {

    // Build a program using the set of root file names in fileNames
    const program: ts.Program = ts.createProgram(fileNames, options);

    // Get the checker, we will use it to find more about classes
    const checker: ts.TypeChecker = program.getTypeChecker();

    const result: File[] = [];

    // Visit every sourceFile in the program
    program.getSourceFiles()
        .forEach((sourceFile: ts.SourceFile): void => {
            if (!sourceFile.isDeclarationFile) {
                const file: File | undefined = getFile(sourceFile, checker);
                if (file !== undefined) {
                    result.push(file);
                }
            }
        });

    return result;

}

function getFile(sourceFile: ts.SourceFile, checker: ts.TypeChecker): File | undefined {

    const file: File = new File();

    // Walk the tree to search for classes
    ts.forEachChild(sourceFile, (node: ts.Node) => {

        // Only consider exported nodes
        if (!isNodeExported(node)) {
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
            file.parts.push(serializeClass(symbol, checker));

            // No need to walk any further, class expressions/inner declarations
            // cannot be exported
        } else if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
            const currentNode: ts.InterfaceDeclaration = <ts.InterfaceDeclaration>node;
            const symbol: ts.Symbol | undefined = checker.getSymbolAtLocation(currentNode.name);
            if (symbol === undefined) {
                return;
            }
            file.parts.push(serializeInterface(symbol, checker));
        } else if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
            // This is a namespace, visit its children
            // ts.forEachChild(<ts.ModuleDeclaration>node, visit);
            return;
        } else if (node.kind === ts.SyntaxKind.EnumDeclaration) {
            const currentNode: ts.EnumDeclaration = <ts.EnumDeclaration>node;
            const symbol: ts.Symbol | undefined = checker.getSymbolAtLocation(currentNode.name);
            if (symbol === undefined) {
                return;
            }
            file.parts.push(serializeEnum(symbol, checker));

            return;
        }
    });

    return file;
}

function hasInitializer(declaration: ts.ParameterDeclaration): boolean {
    return declaration.initializer !== undefined;
}

function isOptional(declaration: ts.ParameterDeclaration | ts.PropertyDeclaration | ts.MethodDeclaration): boolean {
    return declaration.questionToken !== undefined;
}

function serializeParameter(symbol: ts.Symbol, checker: ts.TypeChecker): Parameter {
    const result: Parameter = new Parameter();
    const declarations: ts.ParameterDeclaration[] | undefined = <ts.ParameterDeclaration[]>symbol.getDeclarations();
    if (declarations !== undefined) {
        result.hasInitializer = hasInitializer(declarations[0]);
        result.isOptional = isOptional(declarations[0]);
    }
    result.name = symbol.getName();
    result.type = checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration));

    return result;
}

function getConstraint(memberDeclaration: ts.Declaration, checker: ts.TypeChecker): string | undefined {
    const effectiveConstraint: ts.TypeNode | undefined =
        ts.getEffectiveConstraintOfTypeParameter(<ts.TypeParameterDeclaration>memberDeclaration);

    if (effectiveConstraint === undefined) {
        return;
    }

    return checker.typeToString(checker.getTypeFromTypeNode(effectiveConstraint));
}

function getModifierType(modifiers: ts.NodeArray<ts.Modifier>): 'public' | 'protected' | 'private' {
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

function getMemberModifierType(memberDeclaration: ts.Declaration): 'public' | 'private' | 'protected' {
    const memberModifiers: ts.NodeArray<ts.Modifier> | undefined = memberDeclaration.modifiers;

    if (memberModifiers === undefined ||
        memberModifiers.length === 0) {
        return 'public';
    }

    return getModifierType(memberModifiers);
}

function isAbstract(memberDeclaration: ts.Declaration): boolean {

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

function isStatic(memberDeclaration: ts.Declaration): boolean {

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

function getExtendsHeritageClauseName(heritageClause: ts.HeritageClause): string {
    return (<ts.Identifier>heritageClause.types[0].expression).text;
}

function getInterfaceName(nodeObject: ts.ExpressionWithTypeArguments): string {
    return (<ts.Identifier>nodeObject.expression).text;
}

function getImplementsHeritageClauseNames(heritageClause: ts.HeritageClause): string[] {
    return heritageClause.types.map(getInterfaceName);
}

function serializeEnum(enumSymbol: ts.Symbol, checker: ts.TypeChecker): Enum {
    const result: Enum = new Enum();
    result.name = enumSymbol.getName();

    const declaration: ts.EnumDeclaration[] | undefined = <ts.EnumDeclaration[] | undefined>enumSymbol.getDeclarations();

    if (enumSymbol.exports !== undefined) {
        result.values = serializeEnumProperties(enumSymbol.exports, checker);
    }

    return result;
}

function serializeInterface(interfaceSymbol: ts.Symbol, checker: ts.TypeChecker): Interface {
    const result: Interface = new Interface();
    result.name = interfaceSymbol.getName();

    const declaration: ts.InterfaceDeclaration[] | undefined = <ts.InterfaceDeclaration[] | undefined>interfaceSymbol.getDeclarations();

    if (interfaceSymbol.members !== undefined) {
        result.members = serializeMethods(interfaceSymbol.members, checker);
        result.typeParameters = serializeTypeParameters(interfaceSymbol.members, checker);
    }

    if (declaration !== undefined && declaration.length > 0) {
        const heritageClauses: ts.NodeArray<ts.HeritageClause> | undefined = declaration[declaration.length - 1].heritageClauses;
        if (heritageClauses !== undefined) {
            heritageClauses.forEach((heritageClause: ts.HeritageClause): void => {
                if (heritageClause.token === ts.SyntaxKind.ExtendsKeyword) {
                    result.extends = [getExtendsHeritageClauseName(heritageClause)];
                }
            });
        }
    }

    return result;
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

function serializeEnumProperties(memberSymbols: ts.UnderscoreEscapedMap<ts.Symbol>, checker: ts.TypeChecker): EnumValue[] {
    const result: EnumValue[] = [];

    if (memberSymbols !== undefined) {
        memberSymbols.forEach((memberSymbol: ts.Symbol): void => {
            const memberDeclarations: ts.NamedDeclaration[] | undefined = memberSymbol.getDeclarations();
            if (memberDeclarations === undefined) {
                return;
            }
            memberDeclarations.forEach((memberDeclaration: ts.NamedDeclaration): void => {
                if (memberDeclaration.kind === ts.SyntaxKind.EnumMember) {
                    result.push(serializeEnumMember(memberSymbol, memberDeclaration, checker));
                }
            });
        });
    }

    return result;
}

function serializeMethods(memberSymbols: ts.UnderscoreEscapedMap<ts.Symbol>, checker: ts.TypeChecker): (Property | Method)[] {
    const result: (Property | Method)[] = [];

    if (memberSymbols !== undefined) {
        memberSymbols.forEach((memberSymbol: ts.Symbol): void => {
            const memberDeclarations: ts.NamedDeclaration[] | undefined = memberSymbol.getDeclarations();
            if (memberDeclarations === undefined) {
                return;
            }
            memberDeclarations.forEach((memberDeclaration: ts.NamedDeclaration): void => {
                if (isMethod(memberDeclaration)) {
                    result.push(serializeMethod(memberSymbol, memberDeclaration, checker));
                } else if (isProperty(memberDeclaration)) {
                    result.push(serializeProperty(memberSymbol, memberDeclaration, checker));
                }
            });
        });
    }

    return result;
}

function serializeTypeParameters(memberSymbols: ts.UnderscoreEscapedMap<ts.Symbol>, checker: ts.TypeChecker): TypeParameter[] {
    const result: TypeParameter[] = [];

    if (memberSymbols !== undefined) {
        memberSymbols.forEach((memberSymbol: ts.Symbol): void => {
            const memberDeclarations: ts.NamedDeclaration[] | undefined = memberSymbol.getDeclarations();
            if (memberDeclarations === undefined) {
                return;
            }
            memberDeclarations.forEach((memberDeclaration: ts.NamedDeclaration): void => {
                if (isTypeParameter(memberDeclaration)) {
                    result.push(serializeTypeParameter(memberSymbol, memberDeclaration, checker));
                }
            });
        });
    }

    return result;
}

function serializeClass(classSymbol: ts.Symbol, checker: ts.TypeChecker): Class {

    const result: Class = new Class();

    const classDeclaration: ts.ClassDeclaration[] | undefined = <ts.ClassDeclaration[] | undefined>classSymbol.getDeclarations();

    result.name = classSymbol.getName();

    if (classDeclaration !== undefined && classDeclaration.length > 0) {
        result.isStatic = isStatic(classDeclaration[classDeclaration.length - 1]);
        result.isAbstract = isAbstract(classDeclaration[classDeclaration.length - 1]);
    }

    if (classSymbol.members !== undefined) {
        result.members = serializeMethods(classSymbol.members, checker);
        result.typeParameters = serializeTypeParameters(classSymbol.members, checker);
    }

    if (classSymbol.exports !== undefined) {
        result.members = result.members.concat(serializeMethods(classSymbol.exports, checker));
    }

    if (classSymbol.globalExports !== undefined) {
        result.members = result.members.concat(serializeMethods(classSymbol.globalExports, checker));
    }

    if (classDeclaration !== undefined && classDeclaration.length > 0) {
        const heritageClauses: ts.NodeArray<ts.HeritageClause> | undefined = classDeclaration[classDeclaration.length - 1].heritageClauses;

        if (heritageClauses !== undefined) {
        heritageClauses.forEach((heritageClause: ts.HeritageClause): void => {
            if (heritageClause.token === ts.SyntaxKind.ExtendsKeyword) {
                result.extendsClass = getExtendsHeritageClauseName(heritageClause);
            } else if (heritageClause.token === ts.SyntaxKind.ImplementsKeyword) {
                result.implementsInterfaces = getImplementsHeritageClauseNames(heritageClause);
            }
        });
        }
    }

    return result;
}

function serializeEnumMember(signature: ts.Symbol, namedDeclaration: ts.NamedDeclaration, checker: ts.TypeChecker): EnumValue {
    const result: EnumValue = new EnumValue();
    result.name = signature.getName();

    return result;
}

function serializeMethod(signature: ts.Symbol, namedDeclaration: ts.NamedDeclaration, checker: ts.TypeChecker): Method {
    const result: Method = new Method();
    result.name = signature.getName();
    result.modifier = getMemberModifierType(namedDeclaration);
    result.isAbstract = isAbstract(namedDeclaration);
    result.isOptional = isOptional(<ts.MethodDeclaration>namedDeclaration);
    result.isStatic = isStatic(namedDeclaration);
    const methodSignature: ts.Signature | undefined = checker.getSignatureFromDeclaration(<ts.MethodDeclaration>namedDeclaration);
    if (methodSignature !== undefined) {
        result.returnType = checker.typeToString(methodSignature.getReturnType());
        result.parameters = methodSignature.parameters.map((parameter: ts.Symbol): Parameter => serializeParameter(parameter, checker));
    }

    return result;
}

function serializeTypeParameter(signature: ts.Symbol, namedDeclaration: ts.NamedDeclaration, checker: ts.TypeChecker): TypeParameter {
    const result: TypeParameter = new TypeParameter();
    result.name = signature.getName();
    result.constraint = getConstraint(namedDeclaration, checker);

    return result;
}

function serializeProperty(signature: ts.Symbol, namedDeclaration: ts.NamedDeclaration, checker: ts.TypeChecker): Property {
    const result: Property = new Property();
    result.name = signature.getName();
    result.modifier = getMemberModifierType(namedDeclaration);
    result.isOptional = isOptional(<ts.PropertyDeclaration>namedDeclaration);
    result.isStatic = isStatic(namedDeclaration);
    result.returnType = checker.typeToString(checker.getTypeOfSymbolAtLocation(signature, signature.valueDeclaration));

    return result;
}

function isNodeExported(node: ts.Node): boolean {

    // tslint:disable-next-line no-bitwise
    return (node.flags & ts.ModifierFlags.Export) !== 0 ||
        node.parent.kind === ts.SyntaxKind.SourceFile;
}
