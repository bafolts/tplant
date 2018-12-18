import * as os from 'os';
import { ISerializeSymbol, ISerializeMember, MODIFIER_TYPE } from './ISerializeSymbol';

const TYPES: { [type: string]: string } = {
    [MODIFIER_TYPE.PRIVATE]: '-',
    [MODIFIER_TYPE.PROTECTED]: '#',
    [MODIFIER_TYPE.PUBLIC]: '+'
};

// @TODO: Don't use any type
export function convertToPlant(tsjs: any[]): string {

    const lines: string[] = [];

    lines.push('@startuml');

    tsjs.forEach((serializedSymbol: any): void => {

        let keyword: string = '';
        if (serializedSymbol.keyword !== undefined) {
            keyword = `${serializedSymbol.keyword} `;
        }

        let heritage: string = '';

        if (serializedSymbol.extends !== undefined) {
            heritage += ` extends ${serializedSymbol.extends}`;
        }

        if (serializedSymbol.implements !== undefined) {
            heritage += ` implements ${serializedSymbol.implements.join(', ')}`;
        }

        lines.push(`${keyword}${serializedSymbol.structure} ${serializedSymbol.name}${heritage} {`);

        serializedSymbol.members.forEach((serializedMember: ISerializeMember): void => {

            let line: string = '\t';

            line += TYPES[serializedMember.modifierType];

            if (serializedMember.keyword !== undefined) {
                line += `{${serializedMember.keyword}} `;
            }

            line += serializedMember.name;

            if (serializedMember.type === 'method') {
                line += '(';
                line += serializedMember.parameters.map((parameter: ISerializeSymbol): string => {
                    return `${parameter.name}: ${parameter.type}`;
                })
                    .join(', ');
                line += ')';
            }

            line += `: ${serializedMember.returnType}`;

            lines.push(line);
        });

        lines.push('}');
    });

    lines.push('@enduml');

    return lines.join(os.EOL);

}
