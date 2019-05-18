
import ts from 'typescript';
import * as ComponentFactory from './ComponentFactory';
import { Method } from './Method';
import { Parameter } from './Parameter';
import * as ParameterFactory from './ParameterFactory';

export function create(signature: ts.Symbol, namedDeclaration: ts.NamedDeclaration, checker: ts.TypeChecker): Method {
    const result: Method = new Method();
    result.name = signature.getName();
    result.modifier = ComponentFactory.getMemberModifier(namedDeclaration);
    result.isAbstract = ComponentFactory.isAbstract(namedDeclaration);
    result.isOptional = ComponentFactory.isOptional(<ts.MethodDeclaration>namedDeclaration);
    result.isStatic = ComponentFactory.isStatic(namedDeclaration);
    const methodSignature: ts.Signature | undefined = checker.getSignatureFromDeclaration(<ts.MethodDeclaration>namedDeclaration);
    if (methodSignature !== undefined) {
        result.returnType = checker.typeToString(methodSignature.getReturnType());
        result.parameters = methodSignature.parameters
                                .map((parameter: ts.Symbol): Parameter => ParameterFactory.create(parameter, checker));
    }

    return result;
}
