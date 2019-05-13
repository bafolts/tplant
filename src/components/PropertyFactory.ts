
import ts from 'typescript';
import * as ComponentFactory from './ComponentFactory';
import { Property } from './Property';

export function create(signature: ts.Symbol, namedDeclaration: ts.NamedDeclaration, checker: ts.TypeChecker): Property {
    const result: Property = new Property();
    result.name = signature.getName();
    result.modifier = ComponentFactory.getMemberModifierType(namedDeclaration);
    result.isOptional = ComponentFactory.isOptional(<ts.PropertyDeclaration>namedDeclaration);
    result.isStatic = ComponentFactory.isStatic(namedDeclaration);
    result.returnType = checker.typeToString(checker.getTypeOfSymbolAtLocation(signature, signature.valueDeclaration));

    return result;
}
