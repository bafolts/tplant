import * as os from 'os';
import { Class } from '../Components/Class';
import { Enum } from '../Components/Enum';
import { EnumValue } from '../Components/EnumValue';
import { File } from '../Components/File';
import { Interface } from '../Components/Interface';
import { Method } from '../Components/Method';
import { Namespace } from '../Components/Namespace';
import { Parameter } from '../Components/Parameter';
import { Property } from '../Components/Property';
import { TypeParameter } from '../Components/TypeParameter';
import { ComponentKind } from './ComponentKind';
import { IComponentComposite } from './IComponentComposite';

/**
 * Define a format for class diagram
 */
export abstract class Formatter {

    public header() : string[] {
        return [];
    }

    public footer() : string[] {
        return [];
    }

    // @ts-ignore
    public addAssociation(type1: string, line: string, cardinality: string, type2: string) : string[] {
        return [];
    }

    public serializeFile(file: File) : string {
        const result: string[] = [];
        file.parts.forEach((part: IComponentComposite): void => {
            result.push(this.serialize(part));
        });

        return result.join(os.EOL);
    }

    public abstract serializeClass(component: Class) : string;
    public abstract serializeEnum(component: Enum) : string;

    public serializeEnumValue(component: EnumValue) : string {
        return component.name;
    }

    public abstract serializeInterface(component: Interface) : string;
    public abstract serializeMethod(component: Method) : string;
    public abstract serializeNamespace(component: Namespace) : string;
    public abstract serializeParameter(component: Parameter) : string;
    public abstract serializeProperty(component: Property) : string;
    public abstract serializeTypeParameter(component: TypeParameter) : string;

    public serialize(component: IComponentComposite) : string {
        if (component.componentKind === ComponentKind.CLASS) {
            return this.serializeClass(<Class> component);
        } else if (component.componentKind === ComponentKind.FILE) {
            return this.serializeFile(<File> component);
        } else if (component.componentKind === ComponentKind.ENUM) {
            return this.serializeEnum(<Enum> component);
        } else if (component.componentKind === ComponentKind.ENUM_VALUE) {
            return this.serializeEnumValue(<EnumValue> component);
        } else if (component.componentKind === ComponentKind.INTERFACE) {
            return this.serializeInterface(<Interface> component);
        } else if (component.componentKind === ComponentKind.METHOD) {
            return this.serializeMethod(<Method> component);
        } else if (component.componentKind === ComponentKind.NAMESPACE) {
            return this.serializeNamespace(<Namespace> component);
        } else if (component.componentKind === ComponentKind.PARAMETER) {
            return this.serializeParameter(<Parameter> component);
        } else if (component.componentKind === ComponentKind.PROPERTY) {
            return this.serializeProperty(<Property> component);
        } else if (component.componentKind === ComponentKind.TYPE_PROPERTY) {
            return this.serializeTypeParameter(<TypeParameter> component);
        }
        throw new Error('Unknown Component');
    }
}
