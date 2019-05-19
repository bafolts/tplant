import ts from 'typescript';
import { Enum } from '../Components/Enum';
import { IComponentComposite } from '../Models/IComponentComposite';
import { EnumValueFactory } from './EnumValueFactory';

export namespace EnumFactory {
    export function create(enumSymbol: ts.Symbol): Enum {
        const result: Enum = new Enum(enumSymbol.getName());

        if (enumSymbol.exports !== undefined) {
            result.values = serializeEnumProperties(enumSymbol.exports);
        }

        return result;
    }

    function serializeEnumProperties(memberSymbols: ts.UnderscoreEscapedMap<ts.Symbol>): IComponentComposite[] {
        const result: IComponentComposite[] = [];

        if (memberSymbols !== undefined) {
            memberSymbols.forEach((memberSymbol: ts.Symbol): void => {
                const memberDeclarations: ts.NamedDeclaration[] | undefined = memberSymbol.getDeclarations();
                if (memberDeclarations === undefined) {
                    return;
                }
                memberDeclarations.forEach((memberDeclaration: ts.NamedDeclaration): void => {
                    if (memberDeclaration.kind === ts.SyntaxKind.EnumMember) {
                        result.push(EnumValueFactory.create(memberSymbol));
                    }
                });
            });
        }

        return result;
    }
}
