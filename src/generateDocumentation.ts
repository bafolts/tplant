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
        const returnType = getMemberType(symbol);
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
                symbol.valueDeclaration.kind === ts.SyntaxKind.Parameter) {
                return MEMBER_TYPE.PROPERTY;
            }
            if (symbol.valueDeclaration.kind === ts.SyntaxKind.MethodDeclaration ||
                symbol.valueDeclaration.kind === ts.SyntaxKind.MethodSignature) {
                return MEMBER_TYPE.METHOD;
            }
            if (symbol.valueDeclaration.kind === ts.SyntaxKind.Constructor) {
                return MEMBER_TYPE.CONSTRUCTOR;
            }
        } else if (symbol.declarations !== undefined && symbol.declarations.length > 0) {
            let kind: MEMBER_TYPE | undefined;
            symbol.declarations.some((declaration: ts.Declaration): boolean => {
                if (declaration.kind === ts.SyntaxKind.PropertyDeclaration ||
                    declaration.kind === ts.SyntaxKind.PropertySignature ||
                    declaration.kind === ts.SyntaxKind.Parameter) {
                    kind = MEMBER_TYPE.PROPERTY;

                    return true;
                }
                if (declaration.kind === ts.SyntaxKind.MethodDeclaration ||
                    declaration.kind === ts.SyntaxKind.MethodSignature) {
                    kind = MEMBER_TYPE.METHOD;

                    return true;
                }
                if (declaration.kind === ts.SyntaxKind.Constructor) {
                    kind = MEMBER_TYPE.CONSTRUCTOR;

                    return true;
                }
                if (declaration.kind === ts.SyntaxKind.IndexSignature) {
                    kind = MEMBER_TYPE.INDEX;

                    return true;
                }

                return false;
            });
            if (kind === undefined) {
                throw new Error('unable to determine member type');
            }

            return kind;
        }

        throw new Error('unable to determine member type');
    }

    function getMemberModifierType(symbol: ts.Symbol): MODIFIER_TYPE {
        let keyword: MODIFIER_TYPE = MODIFIER_TYPE.PUBLIC;

        if (symbol.valueDeclaration === undefined ||
            symbol.valueDeclaration.modifiers === undefined ||
            symbol.valueDeclaration.modifiers.length === 0) {
            return keyword;
        }

        symbol.valueDeclaration.modifiers.some((modifier: ts.Modifier): boolean => {
            if (modifier.kind === ts.SyntaxKind.PrivateKeyword) {
                keyword = MODIFIER_TYPE.PRIVATE;

                return true;
            }
            if (modifier.kind === ts.SyntaxKind.PublicKeyword) {
                keyword = MODIFIER_TYPE.PUBLIC;

                return true;
            }
            if (modifier.kind === ts.SyntaxKind.ProtectedKeyword) {
                keyword = MODIFIER_TYPE.PROTECTED;

                return true;
            }

            return false;
        });

        return keyword;
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

    function getInterfaceName(heritageClause: ts.HeritageClause): string {
        return (<ts.Identifier>heritageClause.types[0].expression).text;
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
            const serializedMember: ISerializeMember | void = serializeMember(memberName);
            if (serializedMember === undefined) {
                return;
            }
            serializedInterface.members.push(serializedMember);
        });

        return serializedInterface;
    }

    function serializeEnum(symbol: ts.Symbol): ISerializeEnum {
        const serializedEnum: ISerializeEnum = {
            ...serializeSymbol(symbol),
            members: [],
            structure: STRUCTURE.ENUM
        };

        if (symbol.members === undefined) {
            return serializedEnum;
        }

        symbol.members.forEach((memberName: ts.Symbol): void => {
            serializedEnum.members.push(memberName.name);
        });

        return serializedEnum;
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
                const serializedMember: ISerializeMember | void = serializeMember(memberName);
                if (serializedMember === undefined) {
                    return;
                }
                details.members.push(serializedMember);
            });
        }

        const clauses: ts.NodeArray<ts.HeritageClause> | undefined =
            (<ts.ClassLikeDeclarationBase>symbol.valueDeclaration).heritageClauses;

        if (clauses === undefined) {
            return details;
        }

        clauses.some((heritageClause: ts.HeritageClause): boolean => {
            if (heritageClause.token === ts.SyntaxKind.ExtendsKeyword) {
                details.extends = getExtendsClassName(heritageClause);

                return true;
            }
            if (heritageClause.token === ts.SyntaxKind.ImplementsKeyword) {
                if (details.implements === undefined) {
                    details.implements = [];
                }

                details.implements.push(getInterfaceName(heritageClause));

                return true;
            }
            throw new Error('unsupported heritage clause');
        });

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
