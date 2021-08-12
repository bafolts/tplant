import * as os from 'os';
import { Class } from '../Components/Class';
import { Enum } from '../Components/Enum';
import { EnumValue } from '../Components/EnumValue';
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
        if (comp.name === this.options.targetClass) {
            firstLine.push(':::targetClassDiagram');
        }
        if (comp.typeParameters.length > 0) {
            firstLine.push('~');
            firstLine.push(comp.typeParameters
                .map((typeParameter: IComponentComposite): string => this.serialize(typeParameter))
                .join(', '));
            firstLine.push('~');
        }
        firstLine.push(' {');
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
            result.push(`${this.serialize(member)}`);
        });

        result.push('}');
        if (comp.isAbstract) {
            result.push(`<<abstract>> ${comp.name}`);
        }

        return result.join(os.EOL);
    }

    public addAssociation(type1: string, cardinality: string, type2: string) : string[] {
        return [
            `${type1} ..> "${cardinality}" ${type2}`
        ];
    }

    public serializeEnum(comp: Enum): string {
        const result: string[] = [];
        let declaration: string = `class ${comp.name}`;
        if (comp.values.length > 0) {
            declaration += ' {';
        }
        result.push(declaration);
        comp.values.forEach((enumValue: IComponentComposite): void => {
            result.push(`${this.serializeEnumValue(<EnumValue> enumValue)}`);
        });
        if (comp.values.length > 0) {
            result.push('}');
        }
        result.push(`<<enumeration>> ${comp.name}`);

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
            result.push(`${this.serialize(member)}`);
        });
        if (comp.members.length > 0) {
            result.push('}');
        }
        result.push(`<<Interface>> ${comp.name}`);

        return result.join(os.EOL);
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
        // Namespaces are not handled by mermaid-js
        const result: string[] = [];
        comp.parts.forEach((part: IComponentComposite): void => {
            result.push(this.serialize(part));
        });

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

    public renderFiles(files: IComponentComposite[], associations: boolean) : string {
        // Auto-indent
        let indent : number = 0;

        return super.renderFiles(files, associations)
            .split(os.EOL)
            .map((l: string) => {
                const line : string = '    '.repeat(indent) + l.trim();
                if (line.endsWith('{')) {
                    indent += 1;
                } else if (line.endsWith('}')) {
                    indent -= 1;

                    return line.substr(4);
                }

                return line;
            })
            .join(os.EOL);

    }
}
