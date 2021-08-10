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
 * Export diagram class using plantuml format
 */
export class PlantUMLFormat extends Formatter {

    public header(): string[] {
        return ['@startuml'];
    }

    public footer(): string[] {
        return ['@enduml'];
    }

    public addAssociation(type1: string, cardinality: string, type2: string) : string[] {
        return [
            `${type1} --> "${cardinality}" ${type2}`
        ];
    }

    public serializeClass(comp: Class) : string {
        const result: string[] = [];
        const firstLine: string[] = [];
        if (comp.isAbstract) {
            firstLine.push('abstract ');
        }
        firstLine.push(`class ${comp.name}`);
        if (comp.typeParameters.length > 0) {
            firstLine.push('<');
            firstLine.push(comp.typeParameters
                .map((typeParameter: IComponentComposite): string => this.serializeTypeParameter(<TypeParameter> typeParameter))
                .join(', '));
            firstLine.push('>');
        }
        if (comp.extendsClass !== undefined) {
            firstLine.push(` extends ${comp.extendsClass}`);
        }
        if (!this.options.onlyClasses && comp.implementsInterfaces.length > 0) {
            firstLine.push(` implements ${comp.implementsInterfaces.join(', ')}`);
        }
        this.serializeMembers(comp, firstLine, result);

        return result.join(os.EOL);
    }

    public serializeMembers(comp: Class | Interface, firstLine: string[], result: string[]) : void {
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
    }

    public serializeEnum(comp: Enum): string {
        const result: string[] = [];
        let declaration: string = `enum ${comp.name}`;
        if (comp.values.length > 0) {
            declaration += ' {';
        }
        result.push(declaration);
        comp.values.forEach((enumValue: IComponentComposite): void => {
            result.push(`    ${this.serializeEnumValue(<EnumValue>enumValue)}`);
        });
        if (comp.values.length > 0) {
            result.push('}');
        }

        return result.join(os.EOL);
    }

    public serializeInterface(comp: Interface): string {
        const result: string[] = [];
        const firstLine: string[] = [];
        firstLine.push(`interface ${comp.name}`);
        if (comp.typeParameters.length > 0) {
            firstLine.push('<');
            firstLine.push(comp.typeParameters
                .map((typeParameter: IComponentComposite): string => this.serializeTypeParameter(<TypeParameter> typeParameter))
                .join(', '));
            firstLine.push('>');
        }
        if (comp.extendsInterface.length > 0) {
            firstLine.push(` extends ${comp.extendsInterface.join(', ')}`);
        }
        this.serializeMembers(comp, firstLine, result);

        return result.join(os.EOL);
    }

    public serializeMethod(comp: Method) : string {
        let result: string = { public: '+', private: '-', protected: '#' }[comp.modifier];
        result += (comp.isAbstract ? '{abstract} ' : '');
        result += (comp.isStatic ? '{static} ' : '');
        result += `${comp.name}(`;
        result += comp.parameters
            .map((parameter: IComponentComposite): string => this.serialize(parameter))
            .join(', ');
        result += `): ${comp.returnType}`;

        return result;
    }

    public serializeNamespace(comp: Namespace) : string {
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

    public serializeParameter(comp: Parameter) : string {
        return `${comp.name}${comp.isOptional || comp.hasInitializer ? '?' : ''}: ${comp.parameterType}`;
    }

    public serializeProperty(comp: Property) : string {
        let result: string = { public: '+', private: '-', protected: '#' }[comp.modifier];
        result += (comp.isAbstract ? '{abstract} ' : '');
        result += (comp.isStatic ? '{static} ' : '');
        result += `${comp.name}${(comp.isOptional ? '?' : '')}: ${comp.returnType}`;

        return result;
    }

    public serializeTypeParameter(comp: TypeParameter) : string {
        return `${comp.name}${(comp.constraint !== undefined ? ` extends ${comp.constraint}` : '')}`;
    }

}
