import ts from 'typescript';
import { Parameter } from '../Components/Parameter';
import { ComponentFactory } from './ComponentFactory';

export namespace ParameterFactory {
    export function create(parameterSymbol: ts.Symbol, checker: ts.TypeChecker): Parameter {
        const result: Parameter = new Parameter(parameterSymbol.getName());
        const declarations: ts.ParameterDeclaration[] | undefined = <ts.ParameterDeclaration[]>parameterSymbol.getDeclarations();
        if (declarations !== undefined) {
            result.hasInitializer = ComponentFactory.hasInitializer(declarations[0]);
            result.isOptional = ComponentFactory.isOptional(declarations[0]);
        }
        result.parameterType = checker.typeToString(checker.getTypeOfSymbolAtLocation(parameterSymbol, parameterSymbol.valueDeclaration));

        return result;
    }
}
