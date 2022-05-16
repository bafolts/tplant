import ts from 'typescript';
import { Method } from '../Components/Method';
import { Parameter } from '../Components/Parameter';
import { ComponentFactory } from './ComponentFactory';
import { ParameterFactory } from './ParameterFactory';
import { TypeParameterFactory } from './TypeParameterFactory';

export namespace MethodFactory {
    export function create(signature: ts.Symbol, namedDeclaration: ts.NamedDeclaration, checker: ts.TypeChecker): Method {
        const result: Method = new Method(signature.getName());
        result.modifier = ComponentFactory.getMemberModifier(namedDeclaration);
        result.isAbstract = ComponentFactory.isModifier(namedDeclaration, ts.SyntaxKind.AbstractKeyword);
        result.isOptional = ComponentFactory.isOptional(<ts.MethodDeclaration>namedDeclaration);
        result.isStatic = ComponentFactory.isModifier(namedDeclaration, ts.SyntaxKind.StaticKeyword);
        result.isAsync = ComponentFactory.isModifier(namedDeclaration, ts.SyntaxKind.AsyncKeyword);
        const methodSignature: ts.Signature | undefined = checker.getSignatureFromDeclaration(<ts.MethodDeclaration>namedDeclaration);
        if (methodSignature !== undefined) {
            const returnType: ts.Type = methodSignature.getReturnType();
            result.returnType = checker.typeToString(returnType, namedDeclaration);
            result.returnTypeFile = ComponentFactory.getOriginalFileOriginalType(returnType, checker);
            result.parameters = methodSignature.parameters
                .map((parameter: ts.Symbol): Parameter => ParameterFactory.create(parameter, checker));
            if (methodSignature.typeParameters !== undefined) {
                result.typeParameters = methodSignature.typeParameters
                    .map(
                        (typeParameter: ts.TypeParameter) =>
                        TypeParameterFactory.create(typeParameter.symbol, typeParameter.symbol.declarations[0], checker)
                    );
            }
        }

        return result;
    }
}
