import ts from 'typescript';
import { Method } from '../Components/Method';
import { Parameter } from '../Components/Parameter';
import { ComponentFactory } from './ComponentFactory';
import { ParameterFactory } from './ParameterFactory';

export namespace MethodFactory {
    export function create(signature: ts.Symbol, namedDeclaration: ts.NamedDeclaration, checker: ts.TypeChecker): Method {
        const result: Method = new Method(signature.getName());
        result.modifier = ComponentFactory.getMemberModifier(namedDeclaration);
        result.isAbstract = ComponentFactory.isAbstract(namedDeclaration);
        result.isOptional = ComponentFactory.isOptional(<ts.MethodDeclaration>namedDeclaration);
        result.isStatic = ComponentFactory.isStatic(namedDeclaration);
        const methodSignature: ts.Signature | undefined = checker.getSignatureFromDeclaration(<ts.MethodDeclaration>namedDeclaration);
        if (methodSignature !== undefined) {
            const returnType: ts.Type = methodSignature.getReturnType();
            result.returnType = checker.typeToString(returnType, namedDeclaration);
            result.returnTypeFile = ComponentFactory.getOriginalFileOriginalType(returnType, checker);
            result.parameters = methodSignature.parameters
                .map((parameter: ts.Symbol): Parameter => ParameterFactory.create(parameter, checker));
        }

        return result;
    }
}
