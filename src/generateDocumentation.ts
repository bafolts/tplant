import ts, { EnumDeclaration } from 'typescript';
import {
    ISerializeClass,
    ISerializeEnum,
    ISerializeInterface,
    ISerializeMember,
    ISerializeSignature,
    ISerializeSymbol,
    KEYWORD_TYPE,
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
        return {
            name: symbol.getName(),
            type: checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration))
        };
    }

    function getTypeName(node: ts.TypeNode): string {
        return checker.typeToString(checker.getTypeFromTypeNode(node));
    }

    function serializeMemberFunction(declaration: ts.Declaration): ISerializeMember | void {
        let name: string = 'unknown';
        const keyword: KEYWORD_TYPE | undefined = undefined;
        const anyDeclaration: ts.MethodSignature = <ts.MethodSignature>declaration;
        if ((<ts.Identifier>anyDeclaration.name).escapedText !== undefined) {
            name = String((<ts.Identifier>anyDeclaration.name).escapedText);
        } else {
            console.warn('Unable to find member function name');
        }
        let modifierType: MODIFIER_TYPE = MODIFIER_TYPE.PUBLIC;
        if (anyDeclaration.modifiers !== undefined) {
            modifierType = getModifierType(anyDeclaration.modifiers);
        }
        const parameters: ISerializeSymbol[] = anyDeclaration.parameters.map((parameter: ts.ParameterDeclaration) => {
            return {
                name: String((<ts.Identifier>parameter.name).escapedText),
                type: parameter.type !== undefined ? getTypeName(parameter.type) : 'unknown'
            };
        });

        const anyDeclarationSignature: ts.Signature | undefined = checker.getSignatureFromDeclaration(anyDeclaration);
        let returnType: string = 'any';

        if (anyDeclarationSignature !== undefined) {
            returnType = checker.typeToString(anyDeclarationSignature
                .getReturnType());
        }

        return {
            keyword: keyword,
            modifierType: modifierType,
            name: name,
            parameters: parameters,
            returnType: returnType,
            type: MEMBER_TYPE.METHOD
        };
    }

    function serializeMember(symbol: ts.Symbol): ISerializeMember | void {
        const result: ISerializeMember = {
            keyword: getMemberKeyword(symbol),
            modifierType: getMemberModifierType(symbol),
            name: symbol.getName(),
            parameters: [],
            returnType: getMemberReturnType(symbol),
            type: getMemberType(symbol)
        };

        if (result.type === MEMBER_TYPE.CONSTRUCTOR) {
            return;
        }

        if (result.type === MEMBER_TYPE.METHOD) {
            result.parameters = getParametersForFunction(
                checker.typeToString(
                    checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)
                )
            );
        }

        return result;
    }

    function getMemberReturnType(symbol: ts.Symbol): string {
        const returnType: MEMBER_TYPE = getMemberType(symbol);
        if (returnType === MEMBER_TYPE.PROPERTY || returnType === MEMBER_TYPE.INDEX) {
            return checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration));
        }
        if (returnType === MEMBER_TYPE.METHOD) {
            return getReturnTypeOfFunction(
                checker.typeToString(
                    checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)
                )
            );
        }
        if (returnType === MEMBER_TYPE.CONSTRUCTOR) {
            // Skip constructors
            return '';
        }
        throw new Error('unable to determine return type');
    }

    function getParametersForFunction(typeString: string): ISerializeSymbol[] {
        let parsedType: string = typeString.substring(1);
        parsedType = parsedType.substring(0, parsedType.indexOf(') => '));
        if (parsedType.length === 0) {
            return [];
        }
        const parameters: string[] = parsedType.split(', ');

        return parameters.map((parameter: string): ISerializeSymbol => {
            return {
                name: parameter.substring(0, parameter.indexOf(':')),
                type: parameter.substring(parameter.indexOf(':') + 2)
            };
        });
    }

    function getReturnTypeOfFunction(typeString: string): string {
        return typeString.substring(typeString.lastIndexOf(' => ') + 4);
    }

    function getMemberType(symbol: ts.Symbol): MEMBER_TYPE {
        if (symbol.valueDeclaration !== undefined) {
            if (symbol.valueDeclaration.kind === ts.SyntaxKind.PropertyDeclaration ||
                symbol.valueDeclaration.kind === ts.SyntaxKind.PropertySignature ||
                symbol.valueDeclaration.kind === ts.SyntaxKind.Parameter ||
                symbol.valueDeclaration.kind === ts.SyntaxKind.GetAccessor ||
                symbol.valueDeclaration.kind === ts.SyntaxKind.SetAccessor) {
                return MEMBER_TYPE.PROPERTY;
            }
            if (symbol.valueDeclaration.kind === ts.SyntaxKind.MethodDeclaration ||
                symbol.valueDeclaration.kind === ts.SyntaxKind.MethodSignature) {
                return MEMBER_TYPE.METHOD;
            }
            if (symbol.valueDeclaration.kind === ts.SyntaxKind.Constructor ||
                symbol.valueDeclaration.kind === ts.SyntaxKind.ConstructSignature) {
                return MEMBER_TYPE.CONSTRUCTOR;
            }
            if (symbol.valueDeclaration.kind === ts.SyntaxKind.IndexSignature ||
                symbol.valueDeclaration.kind === ts.SyntaxKind.TypeParameter) {
                return MEMBER_TYPE.INDEX;
            }
        } else if (symbol.declarations !== undefined && symbol.declarations.length > 0) {
            let kind: MEMBER_TYPE | undefined;
            symbol.declarations.some((declaration: ts.Declaration): boolean => {
                if (declaration.kind === ts.SyntaxKind.PropertyDeclaration ||
                    declaration.kind === ts.SyntaxKind.PropertySignature ||
                    declaration.kind === ts.SyntaxKind.Parameter ||
                    declaration.kind === ts.SyntaxKind.GetAccessor ||
                    declaration.kind === ts.SyntaxKind.SetAccessor) {
                    kind = MEMBER_TYPE.PROPERTY;

                    return true;
                }
                if (declaration.kind === ts.SyntaxKind.MethodDeclaration ||
                    declaration.kind === ts.SyntaxKind.MethodSignature) {
                    kind = MEMBER_TYPE.METHOD;

                    return true;
                }
                if (declaration.kind === ts.SyntaxKind.Constructor ||
                    declaration.kind === ts.SyntaxKind.ConstructSignature) {
                    kind = MEMBER_TYPE.CONSTRUCTOR;

                    return true;
                }
                if (declaration.kind === ts.SyntaxKind.IndexSignature ||
                    declaration.kind === ts.SyntaxKind.TypeParameter) {
                    kind = MEMBER_TYPE.INDEX;

                    return true;
                }

                return false;
            });
            if (kind === undefined) {
                throw new Error('unable to determine member type 2');
            }

            return kind;
        }

        throw new Error('unable to determine member type 3');
    }

    function getModifierType(modifiers: ts.NodeArray<ts.Modifier>): MODIFIER_TYPE {
        if (modifiers !== undefined) {
            for (const modifier of modifiers) {
                if (modifier.kind === ts.SyntaxKind.PrivateKeyword) {

                    return MODIFIER_TYPE.PRIVATE;
                }
                if (modifier.kind === ts.SyntaxKind.PublicKeyword) {

                    return MODIFIER_TYPE.PUBLIC;
                }
                if (modifier.kind === ts.SyntaxKind.ProtectedKeyword) {

                    return MODIFIER_TYPE.PROTECTED;
                }
            }
        }

        return MODIFIER_TYPE.PUBLIC;
    }

    function getMemberModifierType(symbol: ts.Symbol): MODIFIER_TYPE {
        const keyword: MODIFIER_TYPE = MODIFIER_TYPE.PUBLIC;

        if (symbol.valueDeclaration === undefined ||
            symbol.valueDeclaration.modifiers === undefined ||
            symbol.valueDeclaration.modifiers.length === 0) {
            return keyword;
        }

        return getModifierType(symbol.valueDeclaration.modifiers);
    }

    function getMemberKeyword(symbol: ts.Symbol): KEYWORD_TYPE | undefined {
        let keyword: KEYWORD_TYPE | undefined;

        if (symbol.valueDeclaration === undefined ||
            symbol.valueDeclaration.modifiers === undefined ||
            symbol.valueDeclaration.modifiers.length === 0) {
            return keyword;
        }

        symbol.valueDeclaration.modifiers.some((modifier: ts.Modifier): boolean => {
            if (modifier.kind === ts.SyntaxKind.AbstractKeyword) {
                keyword = KEYWORD_TYPE.ABSTRACT;

                return true;
            }
            if (modifier.kind === ts.SyntaxKind.StaticKeyword) {
                keyword = KEYWORD_TYPE.STATIC;

                return true;
            }

            return false;
        });

        return keyword;
    }

    function getExtendsClassName(heritageClause: ts.HeritageClause): string {
        return (<ts.Identifier>heritageClause.types[0].expression).text;
    }

    function getInterfaceName(nodeObject: ts.ExpressionWithTypeArguments): string {
        return (<ts.Identifier>nodeObject.expression).text;
    }

    function getInterfaceNames(heritageClause: ts.HeritageClause): string[] {
        return heritageClause.types.map(getInterfaceName);
    }

    function serializeEnum(symbol: ts.Symbol): ISerializeEnum {
        const serializedEnum: ISerializeEnum = {
            ...serializeSymbol(symbol),
            members: [],
            structure: STRUCTURE.ENUM
        };

        if (symbol.exports === undefined) {
            return serializedEnum;
        }

        symbol.exports.forEach((memberName: ts.Symbol): void => {
            serializedEnum.members.push(memberName.name);
        });

        return serializedEnum;
    }

    function serializeInterface(symbol: ts.Symbol): ISerializeInterface {
        const serializedInterface: ISerializeInterface = {
            ...serializeSymbol(symbol),
            members: [],
            structure: STRUCTURE.INTERFACE
        };

        if (symbol.members === undefined) {
            return serializedInterface;
        }

        symbol.members.forEach((memberName: ts.Symbol): void => {
            if (memberName.declarations.length > 1) {
                for (const declaration of memberName.declarations) {
                    const serializedMember: ISerializeMember | void = serializeMemberFunction(declaration);
                    if (serializedMember === undefined) {
                        return;
                    }

                    if (serializedMember.type === MEMBER_TYPE.INDEX) {
                        if (serializedInterface.parameters === undefined) {
                            serializedInterface.parameters = [];
                        }
                        serializedInterface.parameters.push(serializedMember);

                        return;
                    }

                    serializedInterface.members.push(serializedMember);
                }

                return;
            }
            const otherSerializedMember: ISerializeMember | void = serializeMember(memberName);

            if (otherSerializedMember === undefined) {

                return;
            }
            serializedInterface.members.push(otherSerializedMember);
        });

        return serializedInterface;
    }

    /**
     * Serialize a class symbol infomration
     */
    function serializeClass(symbol: ts.Symbol): ISerializeClass {

        // Get the construct signatures
        const constructorType: ts.Type = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);

        const details: ISerializeClass = {
            ...serializeSymbol(symbol),
            constructors: constructorType.getConstructSignatures()
                .map(serializeSignature),
            keyword: getMemberKeyword(symbol),
            members: [],
            structure: STRUCTURE.CLASS
        };

        if (symbol.members !== undefined) {
            symbol.members.forEach((memberName: ts.Symbol): void => {
                if (memberName.declarations.length > 1) {
                    for (const declaration of memberName.declarations) {
                        const serializedMember: ISerializeMember | void = serializeMemberFunction(declaration);
                        if (serializedMember !== undefined) {
                            details.members.push(serializedMember);
                        }
                    }

                    return;
                }
                const otherSerializedMember: ISerializeMember | void = serializeMember(memberName);
                if (otherSerializedMember === undefined) {

                    return;
                }

                if (otherSerializedMember.type === MEMBER_TYPE.INDEX) {
                    if (details.parameters === undefined) {
                        details.parameters = [];
                    }
                    details.parameters.push(otherSerializedMember);

                    return;
                }
                details.members.push(otherSerializedMember);
            });
        }

        if ((<ts.ClassLikeDeclarationBase>symbol.valueDeclaration).members !== undefined) {
            (<ts.ClassLikeDeclarationBase>symbol.valueDeclaration).members.forEach((memberName: ts.ClassElement): void => {
                const classSymbol: ts.Symbol | void = checker.getSymbolAtLocation(
                    (<ts.MethodDeclaration | ts.PropertyDeclaration>memberName).name);
                if (classSymbol === undefined) {
                    return;
                }
                const serializedMember: ISerializeMember | void = serializeMember(classSymbol);
                if (serializedMember === undefined) {
                    return;
                }
                if (serializedMember.type === MEMBER_TYPE.INDEX) {
                    if (details.parameters === undefined) {
                        details.parameters = [];
                    }
                    details.parameters.push(serializedMember);

                    return;
                }
                if (!details.members.some((e: ISerializeMember) => e.name === serializedMember.name)) {
                    details.members.push(serializedMember);
                }
            });
        }

        const clauses: ts.NodeArray<ts.HeritageClause> | undefined =
            (<ts.ClassLikeDeclarationBase>symbol.valueDeclaration).heritageClauses;

        if (clauses === undefined) {
            return details;
        }

        for (const heritageClause of clauses) {
            if (heritageClause.token === ts.SyntaxKind.ExtendsKeyword) {
                details.extends = getExtendsClassName(heritageClause);
            } else if (heritageClause.token === ts.SyntaxKind.ImplementsKeyword) {
                details.implements = getInterfaceNames(heritageClause);
            } else {
                throw new Error('unsupported heritage clause');
            }
        }

        return details;
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
