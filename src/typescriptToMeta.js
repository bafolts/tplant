"use strict";

var fs = require("fs");
var ts = require("typescript");

var PUBLIC_TYPE = "public";
var PRIVATE_TYPE = "private";
var PROTECTED_TYPE = "protected";
var PROPERTY_TYPE = "property";
var METHOD_TYPE = "method";

function generateDocumentation(fileNames, options) {

    // Build a program using the set of root file names in fileNames
    let program = ts.createProgram(fileNames, options);

    // Get the checker, we will use it to find more about classes
    let checker = program.getTypeChecker();

    let output = [];

    // Visit every sourceFile in the program
    for (const sourceFile of program.getSourceFiles()) {
        if (!sourceFile.isDeclarationFile) {
            // Walk the tree to search for classes
            ts.forEachChild(sourceFile, visit);
        }
    }

    return output;

    /** visit nodes finding exported classes */    
    function visit(node) {
        // Only consider exported nodes
        if (!isNodeExported(node)) {
            return;
        }
        if (node.kind === ts.SyntaxKind.ClassDeclaration) {
            // This is a top level class, get its symbol
            let symbol = checker.getSymbolAtLocation(node.name);
            output.push(serializeClass(symbol));
            // No need to walk any further, class expressions/inner declarations
            // cannot be exported
        } else if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
            let symbol = checker.getSymbolAtLocation(node.name);
            output.push(serializeInterface(symbol));
        }
        else if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
            // This is a namespace, visit its children
            ts.forEachChild(node, visit);
        }
    }

    /** Serialize a symbol into a json object */    
    function serializeSymbol(symbol) {
        return {
            name: symbol.getName(),
            type: checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration))
        };
    }

    function serializeMember(symbol) {
        var result = {
            name: symbol.getName(),
            type: getMemberType(symbol),
            modifierType: getMemberModifierType(symbol),
            returnType: getMemberReturnType(symbol)
        };

        if (result.type === METHOD_TYPE) {
            result.parameters = getParametersForFunction(checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)));
        }

        return result;
    }

    function getMemberReturnType(symbol) {

        if (getMemberType(symbol) === PROPERTY_TYPE) {
            return checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration));
        } else if (getMemberType(symbol) === METHOD_TYPE) {
            return getReturnTypeOfFunction(checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)));
        }

    }

    function getParametersForFunction(typeString) {
        var parsedType = typeString.substring(1);
        parsedType = parsedType.substring(0, parsedType.indexOf(") => "));
        if (parsedType.length === 0) {
            return [];
        }
        var parameters = parsedType.split(", ");
        return parameters.map(function (parameter) {
            return {
                name: parameter.substring(0, parameter.indexOf(":")),
                type: parameter.substring(parameter.indexOf(":") + 2)
            };
        });
    }

    function getReturnTypeOfFunction(typeString) {

        return typeString.substring(typeString.lastIndexOf(" => ") + 4);

    }

    function getMemberType(symbol) {

        var kind;

        if (symbol.valueDeclaration) {
            kind = symbol.valueDeclaration.kind;
        }

        if (kind === ts.SyntaxKind.PropertyDeclaration) {
            return PROPERTY_TYPE;
        } else if (kind === ts.SyntaxKind.MethodDeclaration) {
            return METHOD_TYPE;
        } else if (kind === ts.SyntaxKind.MethodSignature) {
            return METHOD_TYPE;
        } else if (kind === ts.SyntaxKind.PropertySignature) {
            return PROPERTY_TYPE;
        }

    }

    function getMemberModifierType(symbol) {

        var kind;

        if (symbol.valueDeclaration &&
                symbol.valueDeclaration.modifiers &&
                symbol.valueDeclaration.modifiers.length) {
            kind = symbol.valueDeclaration.modifiers[0].kind;
        } else {
            // console.warn("Unable to determine modifier type for member");
        }

        if (kind === ts.SyntaxKind.PrivateKeyword) {
            return PRIVATE_TYPE;
        } else if (kind === ts.SyntaxKind.PublicKeyword || kind === undefined) {
            return PUBLIC_TYPE;
        } else if (kind === ts.SyntaxKind.ProtectedKeyword) {
            return PROTECTED_TYPE;
        }

        throw new Error("unable to determine member modifier type");
    }

    function getExtendsClassName(heritageClause) {
        return heritageClause.types[0].expression.text;
    }

    function getInterfaceName(heritageClause) {
        return heritageClause.types[0].expression.text;
    }

    function serializeInterface(symbol) {
        var result = {
            structure: "interface",
            name: symbol.name,
            members: []
        };

        for (var memberName in symbol.members) {
            result.members.push(serializeMember(symbol.members[memberName]));
        }

        return result;
    }

    /** Serialize a class symbol infomration */
    function serializeClass(symbol) {
        let details = serializeSymbol(symbol);

        details.structure = "class";

        if (symbol.valueDeclaration && symbol.valueDeclaration.heritageClauses &&
                symbol.valueDeclaration.heritageClauses.length) {
            symbol.valueDeclaration.heritageClauses.forEach(function (heritageClause) {
                if (heritageClause.token === ts.SyntaxKind.ExtendsKeyword) {
                    details["extends"] = getExtendsClassName(heritageClause);
                } else if (heritageClause.token === ts.SyntaxKind.ImplementsKeyword) {
                    if (details["implements"]) {
                        details["implements"].push(getInterfaceName(heritageClause));
                    } else {
                        details["implements"] = [getInterfaceName(heritageClause)];
                    }
                } else {
                    throw new Error("unsupported heritage clause");
                }
            });
        }

        // Get the construct signatures
        let constructorType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
        details.constructors = constructorType.getConstructSignatures().map(serializeSignature);

        details.members = [];

        for (var memberName in symbol.members) {
            details.members.push(serializeMember(symbol.members[memberName]));
        }

        return details;
    }

    /** Serialize a signature (call or construct) */
    function serializeSignature(signature) {
        return {
            parameters: signature.parameters.map(serializeSymbol),
            returnType: checker.typeToString(signature.getReturnType())
        };
    }

    /** True if this is visible outside this file, false otherwise */
    function isNodeExported(node) {
        return (node.flags & ts.NodeFlags.Export) !== 0 || (node.parent && node.parent.kind === ts.SyntaxKind.SourceFile);
    }
}

module.exports = function (inputFile) {
    return generateDocumentation([inputFile], {
        target: ts.ScriptTarget.ES6,
        module: ts.ModuleKind.CommonJS
    });
}

