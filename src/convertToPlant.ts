import * as os from 'os';
import { Class } from './components/Class';
import { ComponentKind } from './components/ComponentKind';
import { Enum } from './components/Enum';
import { EnumValue } from './components/EnumValue';
import { File } from './components/File';
import { IComponentComposite } from './components/IComponentComposite';
import { Interface } from './components/Interface';
import { Method } from './components/Method';
import { Namespace } from './components/Namespace';
import { Parameter } from './components/Parameter';
import { Property } from './components/Property';
import { TypeParameter } from './components/TypeParameter';

import { ICommandOptions } from './ICommandOptions';

const COMPOSITION_LINE: string = '*--';
const REGEX_ONLY_TYPE_NAMES: RegExp = /\w+/g;

export function convertToPlant(files: IComponentComposite[], options: ICommandOptions = {
    compositions: false,
    onlyInterfaces: false
}): string {

    const lines: string[] = [];
    const compositions: string[] = [];

    if (options.onlyInterfaces) {
        for (const file of files) {
            if (file.componentKind === ComponentKind.FILE) {
                (<File>file).parts = (<File>file).parts
                                        .filter((part: IComponentComposite): boolean => part.componentKind === ComponentKind.INTERFACE);
            }
        }
    }

    lines.push('@startuml');

    files.forEach((file: IComponentComposite): void => {
        const conversion: string = file.toPUML();
        if (conversion !== '') {
            lines.push(conversion);
        }
    });

    if (options.compositions) {
        const mappedTypes: {[x: string]: boolean} = {};
        const outputConstraints: {[x: string]: boolean} = {};
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
            if (file.componentKind === ComponentKind.FILE) {
            (<File>file).parts.forEach((part: IComponentComposite): void => {
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
            }
        });
    }

    lines.push('@enduml');

    return lines.join(os.EOL);
}
