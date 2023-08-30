import ts from 'typescript';
import { Parameter } from '../Components/Parameter';
import * as ComponentFactory from './ComponentFactory';

export function create(parameterSymbol: ts.Symbol, checker: ts.TypeChecker): Parameter {
    const result: Parameter = new Parameter(parameterSymbol.getName());
    const declarations: ts.ParameterDeclaration[] | undefined = <ts.ParameterDeclaration[]>parameterSymbol.getDeclarations();
    let declaration: ts.ParameterDeclaration | undefined;
    if (declarations !== undefined) {
        result.hasInitializer = ComponentFactory.hasInitializer(declarations[0]);
        result.isOptional = ComponentFactory.isOptional(declarations[0]);
        declaration = declarations[0];
    }

    if (parameterSymbol.valueDeclaration === undefined) {
        throw new Error("unable to determine parameterType");
    }

    const typeOfSymbol: ts.Type = checker.getTypeOfSymbolAtLocation(
        parameterSymbol,
        parameterSymbol.valueDeclaration
    );
    result.parameterType = checker.typeToString(
        typeOfSymbol,
        declaration
    );

    result.parameterTypeFile = ComponentFactory.getOriginalFileOriginalType(typeOfSymbol, checker);

    return result;
}
