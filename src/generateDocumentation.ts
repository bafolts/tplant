import ts from 'typescript';
import { ISerializeSymbol, ISerializeClass, ISerializeMember, ISerializeInterface, ISerializeSignature } from './ISerializeSymbol';

enum TYPES {
    PUBLIC = "public",
    PRIVATE = "private",
    PROTECTED = "protected",
    PROPERTY = "property",
    METHOD = "method",
    CONSTRUCTOR = "constructor",
    ABSTRACT = "abstract",
    STATIC = "static"
}

export default function generateDocumentation(fileNames: ReadonlyArray<string>, options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2015,
    module: ts.ModuleKind.CommonJS
}): ISerializeSymbol[] {

    // Build a program using the set of root file names in fileNames
    let program: ts.Program = ts.createProgram(fileNames, options);

    // Get the checker, we will use it to find more about classes
    let checker: ts.TypeChecker = program.getTypeChecker();

    let output: ISerializeSymbol[] = [];

    // Visit every sourceFile in the program
    program.getSourceFiles().forEach((sourceFile: ts.SourceFile): void => {
        if (!sourceFile.isDeclarationFile) {
            // Walk the tree to search for classes
            ts.forEachChild(sourceFile, visit);
        }
    });

    return output;

    /** visit nodes finding exported classes */
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
        //@TODO: ts.SyntaxKind.EnumDeclaration
    }

    /** Serialize a symbol into a json object */
    function serializeSymbol(symbol: ts.Symbol): ISerializeSymbol {
        return {
            name: symbol.getName(),
            type: checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration))
        };
    }

    function serializeMember(symbol: ts.Symbol): ISerializeMember {
        let result: ISerializeMember = {
            name: symbol.getName(),
            type: getMemberType(symbol),
            modifierType: getMemberModifierType(symbol),
            returnType: getMemberReturnType(symbol),
            parameters: [],
            keyword: getMemberKeyword(symbol)
        };

        if (result.type === TYPES.METHOD) {
            result.parameters = getParametersForFunction(checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)));
        }

        return result;
    }

    function getMemberReturnType(symbol: ts.Symbol): string | undefined {
        if (getMemberType(symbol) === TYPES.PROPERTY) {
            return checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration));
        }
        if (getMemberType(symbol) === TYPES.METHOD) {
            return getReturnTypeOfFunction(checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)));
        }
    }

    function getParametersForFunction(typeString: string): ISerializeSymbol[] {
        let parsedType: string = typeString.substring(1);
        parsedType = parsedType.substring(0, parsedType.indexOf(") => "));
        if (parsedType.length === 0) {
            return [];
        }
        const parameters: string[] = parsedType.split(", ");
        return parameters.map((parameter: string): ISerializeSymbol => {
            return {
                name: parameter.substring(0, parameter.indexOf(":")),
                type: parameter.substring(parameter.indexOf(":") + 2)
            };
        });
    }

    function getReturnTypeOfFunction(typeString: string): string {
        return typeString.substring(typeString.lastIndexOf(" => ") + 4);
    }

    function getMemberType(symbol: ts.Symbol): TYPES {
        if (symbol.valueDeclaration) {
            if (symbol.valueDeclaration.kind === ts.SyntaxKind.PropertyDeclaration ||
                symbol.valueDeclaration.kind === ts.SyntaxKind.PropertySignature ||
                symbol.valueDeclaration.kind === ts.SyntaxKind.Parameter) {
                return TYPES.PROPERTY;
            }
            if (symbol.valueDeclaration.kind === ts.SyntaxKind.MethodDeclaration ||
                symbol.valueDeclaration.kind === ts.SyntaxKind.MethodSignature) {
                return TYPES.METHOD;
            }
            if (symbol.valueDeclaration.kind === ts.SyntaxKind.Constructor) {
                return TYPES.CONSTRUCTOR;
            }
        } else if (symbol.declarations && symbol.declarations.length) {
            let kind: TYPES | undefined;
            symbol.declarations.forEach((declaration: ts.Declaration): void => {
                if (declaration.kind === ts.SyntaxKind.PropertyDeclaration ||
                    declaration.kind === ts.SyntaxKind.PropertySignature ||
                    declaration.kind === ts.SyntaxKind.Parameter) {
                    kind = TYPES.PROPERTY;
                    return;
                }
                if (declaration.kind === ts.SyntaxKind.MethodDeclaration ||
                    declaration.kind === ts.SyntaxKind.MethodSignature) {
                    kind = TYPES.METHOD;
                    return;
                }
                if (declaration.kind === ts.SyntaxKind.Constructor) {
                    kind = TYPES.CONSTRUCTOR;
                    return;
                }
            });
            if (kind === undefined) {
                throw new Error("unable to determine member type");
            }
            return kind;
        }

        throw new Error("unable to determine member type");
    }

    function getMemberModifierType(symbol: ts.Symbol): TYPES {
        let keyword: TYPES = TYPES.PUBLIC;

        if (!symbol.valueDeclaration ||
            !symbol.valueDeclaration.modifiers ||
            !symbol.valueDeclaration.modifiers.length) {
            return keyword;
        }

        symbol.valueDeclaration.modifiers.forEach((modifier: ts.Modifier): void => {
            if (modifier.kind === ts.SyntaxKind.PrivateKeyword) {
                keyword = TYPES.PRIVATE;
                return;
            }
            if (modifier.kind === ts.SyntaxKind.PublicKeyword) {
                keyword = TYPES.PUBLIC;
                return;
            }
            if (modifier.kind === ts.SyntaxKind.ProtectedKeyword) {
                keyword = TYPES.PROTECTED;
                return;
            }
        });

        return keyword;
    }

    function getMemberKeyword(symbol: ts.Symbol): TYPES | undefined {
        let keyword: TYPES | undefined;

        if (!symbol.valueDeclaration ||
            !symbol.valueDeclaration.modifiers ||
            !symbol.valueDeclaration.modifiers.length) {
            return keyword;
        }

        symbol.valueDeclaration.modifiers.forEach((modifier: ts.Modifier): void => {
            if (modifier.kind === ts.SyntaxKind.AbstractKeyword) {
                keyword = TYPES.ABSTRACT;
                return;
            }
            if (modifier.kind === ts.SyntaxKind.StaticKeyword) {
                keyword = TYPES.STATIC;
                return;
            }
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
        //@TODO: Generic
        const serializedInterface: ISerializeInterface = {
            ...serializeSymbol(symbol),
            structure: "interface",
            members: []
        };

        if (symbol.members === undefined) {
            return serializedInterface;
        }

        symbol.members.forEach((memberName: ts.Symbol): void => {
            serializedInterface.members.push(serializeMember(memberName));
        });

        return serializedInterface;
    }

    /** Serialize a class symbol infomration */
    function serializeClass(symbol: ts.Symbol): ISerializeClass {

        // Get the construct signatures
        const constructorType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);

        //@TODO: Generic
        let details: ISerializeClass = {
            ...serializeSymbol(symbol),
            structure: "class",
            constructors: constructorType.getConstructSignatures().map(serializeSignature),
            members: [],
            keyword: getMemberKeyword(symbol)
        };

        if (symbol.members !== undefined) {
            symbol.members.forEach((memberName: ts.Symbol): void => {
                details.members.push(serializeMember(memberName));
            });
        }

        const clauses: ts.NodeArray<ts.HeritageClause> | undefined = (<ts.ClassLikeDeclarationBase>symbol.valueDeclaration).heritageClauses;

        if (clauses === undefined) {
            return details;
        }

        clauses.forEach((heritageClause: ts.HeritageClause): void => {
            if (heritageClause.token === ts.SyntaxKind.ExtendsKeyword) {
                details.extends = getExtendsClassName(heritageClause);
                return;
            }
            if (heritageClause.token === ts.SyntaxKind.ImplementsKeyword) {
                if (details.implements === undefined) {
                    details.implements = [];
                }

                details.implements.push(getInterfaceName(heritageClause));
                return;
            }
            throw new Error("unsupported heritage clause");
        });

        return details;
    }

    /** Serialize a signature (call or construct) */
    function serializeSignature(signature: ts.Signature): ISerializeSignature {
        return {
            parameters: signature.parameters.map(serializeSymbol),
            returnType: checker.typeToString(signature.getReturnType())
        };
    }

    /** True if this is visible outside this file, false otherwise */
    function isNodeExported(node: ts.Node): boolean {
        return (node.flags & ts.ModifierFlags.Export) !== 0 || (node.parent && node.parent.kind === ts.SyntaxKind.SourceFile);
    }
}
