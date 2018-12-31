import * as os from 'os';
import {
    ISerializeClass,
    ISerializeEnum,
    ISerializeInterface,
    ISerializeSymbol,
    MEMBER_TYPE,
    MODIFIER_TYPE
} from './ISerializeSymbol';

const TYPES: { [type: string]: string } = {
    [MODIFIER_TYPE.PRIVATE]: '-',
    [MODIFIER_TYPE.PROTECTED]: '#',
    [MODIFIER_TYPE.PUBLIC]: '+'
};

export function convertToPlant(tsjs: (ISerializeInterface | ISerializeEnum | ISerializeClass)[]): string {

    const lines: string[] = [];

    lines.push('@startuml');

    tsjs.forEach((serializedSymbol: ISerializeInterface | ISerializeEnum | ISerializeClass): void => {

        let keyword: string = '';
        if ((<ISerializeClass>serializedSymbol).keyword !== undefined) {
            keyword = `${(<ISerializeClass>serializedSymbol).keyword} `;
        }

        let heritage: string = '';

        if (serializedSymbol.extends !== undefined) {
            heritage += ` extends ${serializedSymbol.extends}`;
        }

        const serializedClass: ISerializeClass = <ISerializeClass>serializedSymbol;
        if (serializedClass.implements !== undefined) {
            heritage += ` implements ${serializedClass.implements.join(', ')}`;
        }

        lines.push(`${keyword}${serializedSymbol.structure} ${serializedSymbol.name}${heritage} {`);

        for (const serializedMember of serializedSymbol.members) {
            let line: string = `    `;
            if (typeof serializedMember === 'string') {
                line += serializedMember;
                lines.push(line);
                continue;
            }

            line += TYPES[serializedMember.modifierType];

            if (serializedMember.keyword !== undefined) {
                line += `{${serializedMember.keyword}} `;
            }

            line += serializedMember.name;

            if (serializedMember.type === MEMBER_TYPE.METHOD) {
                line += '(';
                line += serializedMember.parameters.map((parameter: ISerializeSymbol): string => {
                    return `${parameter.name}: ${parameter.type}`;
                })
                    .join(', ');
                line += ')';
            }

            if (serializedMember.returnType !== undefined) {
                line += `: ${serializedMember.returnType}`;
            }

            lines.push(line);
        }
        lines.push('}');
    });

    lines.push('@enduml');

    return lines.join(os.EOL);

}
