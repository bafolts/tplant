import ts from 'typescript';
import {
    CLASS_MEMBER_KEYWORD,
    ISerializeClass,
    ISerializeEnum,
    ISerializeInterface,
    ISerializeMember,
    ISerializeSignature,
    ISerializeSymbol,
    MEMBER_TYPE,
    MODIFIER_TYPE,
    STRUCTURE
} from './ISerializeSymbol';

// tslint:disable-next-line max-func-body-length
export function generateDocumentation(fileNames: ReadonlyArray<string>, options: ts.CompilerOptions = {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2015
}): (ISerializeInterface | ISerializeEnum | ISerializeClass)[] {

    // Build a program using the set of root file names in fileNames
    const program: ts.Program = ts.createProgram(fileNames, options);

    // Get the checker, we will use it to find more about classes
    const checker: ts.TypeChecker = program.getTypeChecker();

    const output: (ISerializeInterface | ISerializeEnum | ISerializeClass)[] = [];

    // Visit every sourceFile in the program
    program.getSourceFiles()
        .forEach((sourceFile: ts.SourceFile): void => {
            if (!sourceFile.isDeclarationFile) {
                // Walk the tree to search for classes
                ts.forEachChild(sourceFile, visit);
            }
        });

    return output;

    /**
     * visit nodes finding exported classes
     */
    function visit(node: ts.Node): void {
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
            output.push(serializeClass(symbol));

            // No need to walk any further, class expressions/inner declarations
            // cannot be exported
            return;
        }

        if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
            const currentNode: ts.InterfaceDeclaration = <ts.InterfaceDeclaration>node;
            const symbol: ts.Symbol | undefined = checker.getSymbolAtLocation(currentNode.name);
            if (symbol === undefined) {
                return;
            }
            output.push(serializeInterface(symbol));

            return;
        }

        if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
            // This is a namespace, visit its children
            ts.forEachChild(<ts.ModuleDeclaration>node, visit);

            return;
        }

        if (node.kind === ts.SyntaxKind.EnumDeclaration) {
            const currentNode: ts.EnumDeclaration = <ts.EnumDeclaration>node;
            const symbol: ts.Symbol | undefined = checker.getSymbolAtLocation(currentNode.name);
            if (symbol === undefined) {
                return;
            }
            output.push(serializeEnum(symbol));

            return;
        }
    }

    /**
     * Serialize a symbol into a json object
     */
    function serializeSymbol(symbol: ts.Symbol): ISerializeSymbol {
        const declarations: ts.Declaration[] | undefined = symbol.getDeclarations();
        let questionToken: boolean = false;
        if (declarations !== undefined) {
            questionToken = declarations.some((declaration: ts.Declaration): boolean => {
                if ((<ts.ParameterDeclaration>declaration).questionToken === undefined &&
                    (<ts.ParameterDeclaration>declaration).initializer === undefined) {
                    return false;
                }

                return true;
            });
        }

        return {
            name: symbol.getName(),
            type: checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)),
            questionToken
        };
    }

    function serializeMember(memberSymbol: ts.Symbol, memberDeclaration: ts.NamedDeclaration): ISerializeMember | void {
        const result: ISerializeMember = {
            keyword: getMemberKeyword(memberDeclaration),
            modifierType: getMemberModifierType(memberDeclaration),
            name: memberSymbol.getName(),
            parameters: [],
            returnType: getMemberReturnType(memberSymbol, memberDeclaration),
            type: getMemberType(memberDeclaration),
            questionToken: getQuestionToken(memberDeclaration),
            constraint: getConstraint(memberDeclaration)
        };

        if (result.type === MEMBER_TYPE.CONSTRUCTOR) {
            return;
        }

        if (result.type === MEMBER_TYPE.METHOD) {
            const methodSignature: ts.Signature | undefined = checker.getSignatureFromDeclaration(<ts.MethodDeclaration>memberDeclaration);

            if (methodSignature === undefined) {
                return result;
            }

            return {
                ...result,
                ...serializeSignature(methodSignature)
            };
        }

        return result;
    }

    function getMemberReturnType(memberSymbol: ts.Symbol, memberDeclaration: ts.Declaration): string {
        const memberType: MEMBER_TYPE = getMemberType(memberDeclaration);
        if (memberType === MEMBER_TYPE.ENUM || memberType === MEMBER_TYPE.CONSTRUCTOR) {
            // Skip constructors and Enums
            return '';
        }

        return checker.typeToString(checker.getTypeOfSymbolAtLocation(memberSymbol, memberDeclaration));
    }

    function getQuestionToken(memberDeclaration: ts.Declaration): boolean {
        const propertyDeclaration: ts.PropertyDeclaration = <ts.PropertyDeclaration>memberDeclaration;

        return propertyDeclaration.questionToken !== undefined;
    }

    function getConstraint(memberDeclaration: ts.Declaration): string | undefined {
        const effectiveConstraint: ts.TypeNode | undefined =
            ts.getEffectiveConstraintOfTypeParameter(<ts.TypeParameterDeclaration>memberDeclaration);

        if (effectiveConstraint === undefined) {
            return;
        }

        return checker.typeToString(checker.getTypeFromTypeNode(effectiveConstraint));
    }

    function getMemberType(memberDeclaration: ts.Declaration): MEMBER_TYPE {
        switch (memberDeclaration.kind) {
            case ts.SyntaxKind.PropertyDeclaration:
            case ts.SyntaxKind.PropertySignature:
            case ts.SyntaxKind.Parameter:
            case ts.SyntaxKind.GetAccessor:
            case ts.SyntaxKind.SetAccessor:
                return MEMBER_TYPE.PROPERTY;
            case ts.SyntaxKind.MethodDeclaration:
            case ts.SyntaxKind.MethodSignature:
                return MEMBER_TYPE.METHOD;
            case ts.SyntaxKind.Constructor:
            case ts.SyntaxKind.ConstructSignature:
                return MEMBER_TYPE.CONSTRUCTOR;
            case ts.SyntaxKind.IndexSignature:
                return MEMBER_TYPE.INDEX;
            case ts.SyntaxKind.TypeParameter:
                return MEMBER_TYPE.PARAMETER;
            case ts.SyntaxKind.EnumMember:
            case ts.SyntaxKind.EnumDeclaration:
                return MEMBER_TYPE.ENUM;
            default:
                throw new Error('unable to determine member type');
        }
    }

    function getModifierType(modifiers: ts.NodeArray<ts.Modifier>): MODIFIER_TYPE {
        let modifierType: MODIFIER_TYPE = MODIFIER_TYPE.PUBLIC;

        modifiers.some((modifier: ts.Modifier): boolean => {
            if (modifier.kind === ts.SyntaxKind.PrivateKeyword) {
                modifierType = MODIFIER_TYPE.PRIVATE;

                return true;
            }
            if (modifier.kind === ts.SyntaxKind.PublicKeyword) {
                modifierType = MODIFIER_TYPE.PUBLIC;

                return true;
            }
            if (modifier.kind === ts.SyntaxKind.ProtectedKeyword) {
                modifierType = MODIFIER_TYPE.PROTECTED;

                return true;
            }

            return false;
        });

        return modifierType;
    }

    function getMemberModifierType(memberDeclaration: ts.Declaration): MODIFIER_TYPE {
        const memberModifiers: ts.NodeArray<ts.Modifier> | undefined = memberDeclaration.modifiers;

        if (memberModifiers === undefined ||
            memberModifiers.length === 0) {
            return MODIFIER_TYPE.PUBLIC;
        }

        return getModifierType(memberModifiers);
    }

    function getMemberKeyword(memberDeclaration: ts.Declaration): CLASS_MEMBER_KEYWORD | undefined {
        let memberKeyword: CLASS_MEMBER_KEYWORD | undefined;

        const memberModifiers: ts.NodeArray<ts.Modifier> | undefined = memberDeclaration.modifiers;

        if (memberModifiers === undefined ||
            memberModifiers.length === 0) {
            return memberKeyword;
        }

        memberModifiers.some((memberModifier: ts.Modifier): boolean => {
            if (memberModifier.kind === ts.SyntaxKind.AbstractKeyword) {
                memberKeyword = CLASS_MEMBER_KEYWORD.ABSTRACT;

                return true;
            }
            if (memberModifier.kind === ts.SyntaxKind.StaticKeyword) {
                memberKeyword = CLASS_MEMBER_KEYWORD.STATIC;

                return true;
            }

            return false;
        });

        return memberKeyword;
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

    function serializeEnum(enumSymbol: ts.Symbol): ISerializeEnum {
        return {
            ...serializeInterface(enumSymbol),
            structure: STRUCTURE.ENUM
        };
    }

    function serializeInterface(interfaceSymbol: ts.Symbol): ISerializeInterface {
        const serializedInterface: ISerializeInterface = {
            ...serializeSymbol(interfaceSymbol),
            members: [],
            structure: STRUCTURE.INTERFACE
        };

        if (interfaceSymbol.members !== undefined) {
            interfaceSymbol.members.forEach(handleInterfaceMemberSymbols);
        }

        if (interfaceSymbol.exports !== undefined) {
            interfaceSymbol.exports.forEach(handleInterfaceMemberSymbols);
        }

        if (interfaceSymbol.globalExports !== undefined) {
            interfaceSymbol.globalExports.forEach(handleInterfaceMemberSymbols);
        }

        const interfaceDeclarations: ts.InterfaceDeclaration[] | undefined =
            <ts.InterfaceDeclaration[] | undefined>interfaceSymbol.getDeclarations();

        if (interfaceDeclarations === undefined) {
            return serializedInterface;
        }

        interfaceDeclarations.forEach((interfaceDeclaration: ts.InterfaceDeclaration): void => {
            const heritageClauses: ts.NodeArray<ts.HeritageClause> | undefined = interfaceDeclaration.heritageClauses;

            if (heritageClauses === undefined) {
                return;
            }

            heritageClauses.forEach((heritageClause: ts.HeritageClause): void => {
                if (heritageClause.token === ts.SyntaxKind.ExtendsKeyword) {
                    serializedInterface.extends = getExtendsHeritageClauseName(heritageClause);

                    return;
                }
                if (heritageClause.token === ts.SyntaxKind.ImplementsKeyword) {
                    serializedInterface.implements = getImplementsHeritageClauseNames(heritageClause);

                    return;
                }

                throw new Error('unsupported heritage clause');
            });
        });

        return serializedInterface;

        function handleInterfaceMemberSymbols(memberSymbol: ts.Symbol): void {
            const memberDeclarations: ts.NamedDeclaration[] | undefined = memberSymbol.getDeclarations();

            if (memberDeclarations === undefined) {
                return;
            }

            memberDeclarations.forEach((memberDeclaration: ts.NamedDeclaration): void => {
                const serializedMember: ISerializeMember | void = serializeMember(memberSymbol, memberDeclaration);
                if (serializedMember === undefined) {
                    return;
                }

                if (serializedMember.type === MEMBER_TYPE.PARAMETER) {
                    if (serializedInterface.parameters === undefined) {
                        serializedInterface.parameters = [];
                    }
                    serializedInterface.parameters.push(serializedMember);

                    return;
                }

                serializedInterface.members.push(serializedMember);
            });
        }
    }

    function serializeClass(classSymbol: ts.Symbol): ISerializeClass {

        let classKeyword: CLASS_MEMBER_KEYWORD | undefined;

        const classDeclaration: ts.Declaration[] | undefined = classSymbol.getDeclarations();

        if (classDeclaration !== undefined && classDeclaration.length > 0) {
            classKeyword = getMemberKeyword(classDeclaration[classDeclaration.length - 1]);
        }

        // Get the construct signatures
        const constructorType: ts.Type = checker.getTypeOfSymbolAtLocation(classSymbol, classSymbol.valueDeclaration);

        return {
            ...serializeInterface(classSymbol),
            structure: STRUCTURE.CLASS,
            keyword: classKeyword,
            constructors: constructorType.getConstructSignatures()
                .map(serializeSignature)
        };
    }

    /**
     * Serialize a signature (call or construct)
     */
    function serializeSignature(signature: ts.Signature): ISerializeSignature {
        return {
            parameters: signature.parameters.map(serializeSymbol),
            returnType: checker.typeToString(signature.getReturnType())
        };
    }

    /**
     * True if this is visible outside this file, false otherwise
     */
    function isNodeExported(node: ts.Node): boolean {
        // tslint:disable-next-line no-bitwise
        return (node.flags & ts.ModifierFlags.Export) !== 0 ||
            node.parent.kind === ts.SyntaxKind.SourceFile;
    }
}
