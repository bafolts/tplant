
import ts from 'typescript';
import { EnumValue } from './EnumValue';

export function create(signature: ts.Symbol, namedDeclaration: ts.NamedDeclaration, checker: ts.TypeChecker): EnumValue {
    const result: EnumValue = new EnumValue();
    result.name = signature.getName();

    return result;
}
