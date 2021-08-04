import * as os from 'os';
import { Class } from '../Components/Class';
import { Enum } from '../Components/Enum';
import { Interface } from '../Components/Interface';
import { Method } from '../Components/Method';
import { Namespace } from '../Components/Namespace';
import { Parameter } from '../Components/Parameter';
import { Property } from '../Components/Property';
import { TypeParameter } from '../Components/TypeParameter';
import { Formatter } from '../Models/Formatter';
import { IComponentComposite } from '../Models/IComponentComposite';

/**
 * Export diagram class using mermaidjs format
 */
export class MermaidFormat extends Formatter {

    public header() : string[] {
        return ['classDiagram'];
    }

    public serializeClass(comp: Class) : string {
        const result: string[] = [];
        const firstLine: string[] = [];
        firstLine.push(`class ${comp.name}`);
        if (comp.typeParameters.length > 0) {
            firstLine.push('~');
            firstLine.push(comp.typeParameters
                .map((typeParameter: IComponentComposite): string => this.serialize(typeParameter))
                .join(', '));
            firstLine.push('~');
        }
        firstLine.push('{');
        if (comp.extendsClass !== undefined) {
            result.push(`${comp.extendsClass} <|-- ${comp.name}`);
        }
        if (comp.implementsInterfaces.length > 0) {
            comp.implementsInterfaces.map((inter: string) => {
                result.push(`${inter} <|.. ${comp.name}`);
            });
        }
        result.push(firstLine.join(''));
        comp.members.forEach((member: IComponentComposite): void => {
            result.push(`\t${this.serialize(member)}`);
        });

        result.push('}');
        if (comp.isAbstract) {
            result.push(`<<abstract>> ${comp.name}`);
        }

        return result.map((l: string) => `\t${l}`)
            .join(os.EOL);
    }

    public serializeEnum(comp: Enum): string {
        const result: string[] = [];
        let declaration: string = `enum ${comp.name}`;
        if (comp.values.length > 0) {
            declaration += ' {';
        }
        result.push(declaration);
        comp.values.forEach((enumValue: IComponentComposite): void => {
            result.push(`    ${this.serialize(enumValue)}`);
        });
        if (comp.values.length > 0) {
            result.push('}');
        }

        return result.join(os.EOL);
    }

    public serializeInterface(comp: Interface): string {
        const result: string[] = [];
        const firstLine: string[] = [];
        firstLine.push(`class ${comp.name}`);
        if (comp.typeParameters.length > 0) {
            firstLine.push('~');
            firstLine.push(comp.typeParameters
                .map((typeParameter: IComponentComposite): string => this.serialize(typeParameter))
                .join(', '));
            firstLine.push('~');
        }
        if (comp.extendsInterface.length > 0) {
            comp.extendsInterface.map((inter: string) => {
                result.push(`${inter} <|.. ${comp.name}`);
            });
        }
        if (comp.members.length > 0) {
            firstLine.push(' {');
        }
        result.push(firstLine.join(''));
        comp.members.forEach((member: IComponentComposite): void => {
            result.push(`    ${this.serialize(member)}`);
        });
        if (comp.members.length > 0) {
            result.push('}');
        }
        result.push(`<<Interface>> ${comp.name}`);

        return result.map((l: string) => `\t${l}`)
            .join(os.EOL);
    }

    public serializeMethod(comp: Method) : string {
        let result: string = { public: '+', private: '-', protected: '#' }[comp.modifier];
        result += `${comp.name}(`;
        result += comp.parameters
            .map((parameter: IComponentComposite): string => this.serialize(parameter))
            .join(', ');
        result += `)${(comp.isAbstract ? '*' : '')}${(comp.isStatic ? '$' : '')}: ${this.cleanType(comp.returnType)}`;

        return result;
    }

    public serializeNamespace(comp: Namespace) : string {
        // Check here
        const result: string[] = [];
        result.push(`namespace ${comp.name} {`);
        comp.parts.forEach((part: IComponentComposite): void => {
            result.push(
                this.serialize(part)
                    .replace(/^(?!\s*$)/gm, '    ')
            );
        });
        result.push('}');

        return result.join(os.EOL);
    }

    public cleanType(typeDef: string) : string {
        if (typeDef !== undefined && typeDef.includes('{')) {
            return 'Inline';
        }

        return typeDef;
    }

    public serializeParameter(comp: Parameter) : string {
        let result : string = `${comp.name}${comp.isOptional || comp.hasInitializer ? '?' : ''}`;
        const typeDef : string = this.cleanType(comp.parameterType);
        if (typeDef !== undefined) {
            result += `: ${typeDef}`;
        }

        return result;
    }

    public serializeProperty(comp: Property) : string {
        let result: string = { public: '+', private: '-', protected: '#' }[comp.modifier];
        result += `${comp.name}${(comp.isOptional ? '?' : '')}${(comp.isAbstract ? '*' : '')}${(comp.isStatic ? '$' : '')}: ${this.cleanType(comp.returnType)}`;

        return result;
    }

    public serializeTypeParameter(comp: TypeParameter) : string {
        return `${comp.name}`;
    }

}
