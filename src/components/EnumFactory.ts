
import ts from 'typescript';
import * as ComponentFactory from './ComponentFactory';
import { Enum } from './Enum';
import { EnumValue } from './EnumValue';
import * as EnumValueFactory from './EnumValueFactory';

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
                    result.push(EnumValueFactory.create(memberSymbol, memberDeclaration, checker));
                }
            });
        });
    }

    return result;
}

export function create(enumSymbol: ts.Symbol, checker: ts.TypeChecker): Enum {
    const result: Enum = new Enum();
    result.name = enumSymbol.getName();

    const declaration: ts.EnumDeclaration[] | undefined = <ts.EnumDeclaration[] | undefined>enumSymbol.getDeclarations();

    if (enumSymbol.exports !== undefined) {
        result.values = serializeEnumProperties(enumSymbol.exports, checker);
    }

    return result;
}
