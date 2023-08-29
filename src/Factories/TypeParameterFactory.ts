import ts from 'typescript';
import { TypeParameter } from '../Components/TypeParameter';
import * as ComponentFactory from './ComponentFactory';

export function getConstraint(memberDeclaration: ts.Declaration, checker: ts.TypeChecker): ts.Type | undefined {
    const effectiveConstraint: ts.TypeNode | undefined =
        ts.getEffectiveConstraintOfTypeParameter(<ts.TypeParameterDeclaration>memberDeclaration);

    if (effectiveConstraint === undefined) {
        return;
    }

    return checker.getTypeFromTypeNode(effectiveConstraint);
}

export function create(signature: ts.Symbol, namedDeclaration: ts.NamedDeclaration | undefined, checker: ts.TypeChecker): TypeParameter {
    const result: TypeParameter = new TypeParameter(signature.getName());

    if (namedDeclaration === undefined) {
        return result;
    }

    const constraintType: ts.Type | undefined = getConstraint(namedDeclaration, checker);

    if (constraintType !== undefined) {
        result.constraint = checker.typeToString(constraintType);
        result.constraintFile = ComponentFactory.getOriginalFileOriginalType(constraintType, checker);
    }

    return result;
}
