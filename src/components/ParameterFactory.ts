
import ts from 'typescript';
import * as ComponentFactory from './ComponentFactory';
import { Parameter } from './Parameter';

export function create(symbol: ts.Symbol, checker: ts.TypeChecker): Parameter {
    const result: Parameter = new Parameter();
    const declarations: ts.ParameterDeclaration[] | undefined = <ts.ParameterDeclaration[]>symbol.getDeclarations();
    if (declarations !== undefined) {
        result.hasInitializer = ComponentFactory.hasInitializer(declarations[0]);
        result.isOptional = ComponentFactory.isOptional(declarations[0]);
    }
    result.name = symbol.getName();
    result.type = checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration));

    return result;
}
