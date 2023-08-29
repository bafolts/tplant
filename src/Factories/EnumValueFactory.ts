import ts from 'typescript';
import { EnumValue } from '../Components/EnumValue';

export function create(signature: ts.Symbol): EnumValue {
    return new EnumValue(signature.getName());
}
