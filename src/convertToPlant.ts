import * as os from 'os';
import { Class } from './components/Class';
import { Enum } from './components/Enum';
import { EnumValue } from './components/EnumValue';
import { File } from './components/File';
import { Interface } from './components/Interface';
import { Method } from './components/Method';
import { Namespace } from './components/Namespace';
import { Parameter } from './components/Parameter';
import { Property } from './components/Property';
import { TypeParameter } from './components/TypeParameter';

import { ICommandOptions } from './ICommandOptions';

const COMPOSITION_LINE: string = '*--';
const REGEX_ONLY_TYPE_NAMES: RegExp = /\w+/g;

export function convertToPlant(files: File[], options: ICommandOptions = {
    compositions: false,
    onlyInterfaces: false
}): string {

    const lines: string[] = [];
    const compositions: string[] = [];

    if (options.onlyInterfaces) {
        for (const file of files) {
            file.parts = file.parts.filter((part: Class | Enum | Interface | Namespace): boolean => part instanceof Interface);
        }
    }

    lines.push('@startuml');

    files.forEach((file: File): void => {
        const conversion: string = convertFile(file);
        if (conversion !== '') {
            lines.push(conversion);
        }
    });

    if (options.compositions) {
        const mappedTypes: {[x: string]: boolean} = {};
        const outputConstraints: {[x: string]: boolean} = {};
        files.forEach((file: File): void => {
            file.parts.forEach((part: Class | Namespace | Enum | Interface): void => {
                if (part instanceof Class || part instanceof Interface || part instanceof Enum) {
                    mappedTypes[part.name] = true;
                }
            });
        });
        files.forEach((file: File): void => {
            file.parts.forEach((part: Class | Namespace | Enum | Interface): void => {
                if (part instanceof Class || part instanceof Interface) {
                    part.members.forEach((member: Method | Property): void => {
                        let checks: string[] = [];
                        if (member instanceof Method) {
                            member.parameters.forEach((p: Parameter): void => {
                                const parameters: string[] | null = p.type.match(REGEX_ONLY_TYPE_NAMES);
                                if (parameters !== null) {
                                    checks = checks.concat(parameters);
                                }
                            });
                        }
                        const returnTypes: string[] | null = member.returnType.match(REGEX_ONLY_TYPE_NAMES);
                        if (returnTypes !== null) {
                            checks = checks.concat(returnTypes);
                        }
                        for (const allTypeName of checks) {
                            const key: string = `${part.name} ${COMPOSITION_LINE} ${allTypeName}`;
                            if (allTypeName !== part.name &&
                                !outputConstraints.hasOwnProperty(key) && mappedTypes.hasOwnProperty(allTypeName)) {
                                lines.push(key);
                                outputConstraints[key] = true;
                            }
                        }
                    });
                }
            });
        });
    }

    lines.push('@enduml');

    return lines.join(os.EOL);
}

function modifierToSymbol(modifier: 'public' | 'protected' | 'private'): string {
    if (modifier === 'public') {
        return '+';
    }
    if (modifier === 'private') {
        return '-';
    }

    return '#';
}

function convertParameter(parameter: Parameter): string {
    return `${parameter.name}${parameter.isOptional || parameter.hasInitializer ? '?' : ''}: ${parameter.type}`;
}

function convertMethod(method: Method): string {
    let result: string = modifierToSymbol(method.modifier);
    result += (method.isAbstract ? '{abstract} ' : '');
    result += (method.isStatic ? '{static} ' : '');
    result += `${method.name}(`;
    result += method.parameters
                .map(convertParameter)
                .join(', ');
    result += `): ${method.returnType}`;

    return result;
}

function convertProperty(property: Property): string {

    return `${modifierToSymbol(property.modifier)}${(property.isStatic ? '{static} ' : '')
                }${property.name}${(property.isOptional ? '?' : '')}: ${property.returnType}`;
}

function convertTypeParameter(typeParameter: TypeParameter): string {

    return `${typeParameter.name}${(typeParameter.constraint !== undefined ? ` extends ${typeParameter.constraint}` : '')}`;
}

function convertEnum(enu: Enum): string {
    const result: string[] = [];
    result.push(`enum ${enu.name} {`);
    enu.values.forEach((enumValue: EnumValue): void => {
        result.push(`    ${enumValue.name}`);
    });
    result.push('}');

    return result.join(os.EOL);
}

function convertClass(cls: Class): string {
    const result: string[] = [];
    result.push(`${(cls.isAbstract ? 'abstract ' : '')}class ${cls.name}${convertTypeParameters(cls.typeParameters)
        }${(cls.extendsClass !== '' ? ` extends ${cls.extendsClass}` : '')
        }${(cls.implementsInterfaces.length > 0 ? ` implements ${cls.implementsInterfaces.join(', ')}` : '')} {`);
    cls.members.forEach((member: Method | Property): void => {
        if (member instanceof Method) {
            result.push(`    ${convertMethod(member)}`);
        } else if (member instanceof Property) {
            result.push(`    ${convertProperty(member)}`);
        }
    });
    result.push('}');

    return result.join(os.EOL);
}

function convertTypeParameters(typeParameters: TypeParameter[]): string {
    if (typeParameters.length > 0) {
        return `<${typeParameters
                    .map(convertTypeParameter)
                    .join(', ')}>`;
    }

    return '';
}

function convertExtends(exts: string[]): string {
    if (exts.length > 0) {
        return ` extends ${exts.join(', ')}`;
    }

    return '';
}

function convertInterface(inter: Interface): string {
    const result: string[] = [];
    result.push(`interface ${inter.name}${convertTypeParameters(inter.typeParameters)}${convertExtends(inter.extends)} {`);
    inter.members.forEach((member: Method | Property): void => {
        if (member instanceof Method) {
            result.push(`    ${convertMethod(member)}`);
        } else if (member instanceof Property) {
            result.push(`    ${convertProperty(member)}`);
        }
    });
    result.push('}');

    return result.join(os.EOL);
}

function convertFile(file: File): string {
    const result: string[] = [];
    file.parts.forEach((part: Interface | Class | Enum | Namespace): void => {
        if (part instanceof Interface) {
            result.push(convertInterface(part));
        } else if (part instanceof Class) {
            result.push(convertClass(part));
        } else if (part instanceof Enum) {
            result.push(convertEnum(part));
        }
    });

    return result.join(os.EOL);
}
