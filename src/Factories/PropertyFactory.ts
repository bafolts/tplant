import ts from 'typescript';
import { Property } from '../Components/Property';
import { ComponentFactory } from './ComponentFactory';

export namespace PropertyFactory {
    export function create(signature: ts.Symbol, namedDeclaration: ts.NamedDeclaration, checker: ts.TypeChecker): Property {
        const result: Property = new Property(signature.getName());
        result.modifier = ComponentFactory.getMemberModifier(namedDeclaration);
        result.isAbstract = ComponentFactory.isModifier(namedDeclaration, ts.SyntaxKind.AbstractKeyword);
        result.isOptional = ComponentFactory.isOptional(<ts.PropertyDeclaration>namedDeclaration);
        result.isStatic = ComponentFactory.isModifier(namedDeclaration, ts.SyntaxKind.StaticKeyword);
        result.isReadonly = ComponentFactory.isModifier(namedDeclaration, ts.SyntaxKind.ReadonlyKeyword);
        result.returnType = checker.typeToString(
            checker.getTypeOfSymbolAtLocation(
                signature,
                signature.valueDeclaration
            ),
            namedDeclaration
        );

        return result;
    }
}
