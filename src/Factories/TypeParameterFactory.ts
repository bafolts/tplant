import ts from 'typescript';
import { TypeParameter } from '../Components/TypeParameter';

export namespace TypeParameterFactory {
    export function getConstraint(memberDeclaration: ts.Declaration, checker: ts.TypeChecker): string | undefined {
        const effectiveConstraint: ts.TypeNode | undefined =
            ts.getEffectiveConstraintOfTypeParameter(<ts.TypeParameterDeclaration>memberDeclaration);

        if (effectiveConstraint === undefined) {
            return;
        }

        return checker.typeToString(checker.getTypeFromTypeNode(effectiveConstraint));
    }

    export function create(signature: ts.Symbol, namedDeclaration: ts.NamedDeclaration, checker: ts.TypeChecker): TypeParameter {
        const result: TypeParameter = new TypeParameter(signature.getName());
        result.constraint = getConstraint(namedDeclaration, checker);

        return result;
    }
}
