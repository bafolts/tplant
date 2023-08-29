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
import { ICommandOptions } from './ICommandOptions';
import { IComponentComposite } from './IComponentComposite';

const REGEX_ONLY_TYPE_NAMES: RegExp = /\w+/g;
const REGEX_TYPE_NAMES_WITH_ARRAY: RegExp = /\w+(?:\[\])?/g;

/**
 * Define a format for class diagram
 */
export abstract class Formatter {

    /**
     * Options sent to the cli
     */
    protected options: ICommandOptions;

    constructor(options: ICommandOptions) {
        this.options = options;
    }

    public header() : string[] {
        return [];
    }

    public footer() : string[] {
        return [];
    }

    public abstract addAssociation(type1: string, cardinality: string, type2: string) : string[];

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

    public renderFiles(files: IComponentComposite[], associations: boolean) : string {
        const lines : string[] = [];

        lines.push(...this.header());

        files.forEach((file: IComponentComposite): void => {
            const conversion: string = this.serialize(file);
            if (conversion !== '') {
                lines.push(conversion);
            }
        });

        if (associations) {
            lines.push(...this.createAssociations(files));
        }
        lines.push(...this.footer());

        return lines.join(os.EOL);
    }

    public createAssociations(files: IComponentComposite[]): string[] {
        const associations: string[] = [];

        const mappedTypes: { [x: string]: boolean } = {};
        const outputConstraints: { [x: string]: boolean } = {};
        files.forEach((file: IComponentComposite): void => {
            (<File>file).parts.forEach((part: IComponentComposite): void => {
                if (part.componentKind === ComponentKind.CLASS ||
                    part.componentKind === ComponentKind.INTERFACE ||
                    part.componentKind === ComponentKind.ENUM
                ) {
                    mappedTypes[part.name] = true;
                }
            });
        });
        files.forEach((file: IComponentComposite): void => {
            if (file.componentKind !== ComponentKind.FILE) {
                return;
            }

            (<File>file).parts.forEach((part: IComponentComposite): void => {
                if (!(part instanceof Class) && !(part instanceof Interface)) {
                    return;
                }

                part.members.forEach((member: IComponentComposite): void => {
                    let checks: string[] = [];

                    if (member instanceof Method) {
                        member.parameters.forEach((parameter: IComponentComposite): void => {
                            const parameters: string[] | null = (<Parameter>parameter).parameterType.match(REGEX_ONLY_TYPE_NAMES);
                            if (parameters !== null) {
                                checks = checks.concat(parameters);
                            }
                        });
                    }

                    // include the fact the type is an array, to support cardinalities
                    const returnTypes: string[] | null = (<Method | Property>member).returnType.match(REGEX_TYPE_NAMES_WITH_ARRAY);
                    if (returnTypes !== null) {
                        checks = checks.concat(returnTypes);
                    }

                    for (const tempTypeName of checks) {
                        let typeName: string = tempTypeName;
                        let cardinality: string = '1';
                        if (tempTypeName.endsWith('[]')) {
                            cardinality = '*';
                            typeName = typeName.substring(0, typeName.indexOf('[]'));
                        }
                        const key: string = `${part.name} ${cardinality} ${typeName}`;
                        if (typeName !== part.name &&
                            !Object.prototype.hasOwnProperty.call(outputConstraints, key) && Object.prototype.hasOwnProperty.call(mappedTypes, typeName)) {
                            associations.push(...this.addAssociation(part.name, cardinality, typeName));
                            outputConstraints[key] = true;
                        }
                    }

                });
            });
        });

        return associations;
    }
}
