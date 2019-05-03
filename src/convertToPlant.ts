import * as os from 'os';
import {
    ISerializeClass,
    ISerializeEnum,
    ISerializeInterface,
    ISerializeMember,
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

        let parameters: string = '';
        if (serializedClass.parameters !== undefined && serializedClass.parameters.length > 0) {
            parameters = `<${serializedClass.parameters.map(
                (parameter: ISerializeMember): string => parameter.name
            )
            .join(', ')}>`;
        }

        let openingBrace: string = '';
        if (serializedSymbol.members.length > 0) {
            openingBrace = ' {';
        }

        lines.push(`${keyword}${serializedSymbol.structure} ${serializedSymbol.name}${parameters}${heritage}${openingBrace}`);

        for (const serializedMember of serializedSymbol.members) {
            lines.push(memberToString(serializedMember));
        }

        if (serializedSymbol.members.length > 0) {
            lines.push('}');
        }
    });

    lines.push('@enduml');

    return lines.join(os.EOL);

    function memberToString(member: string | ISerializeMember): string {

        let line: string = `    `;

        if (typeof member === 'string') {
            line += member;

            return line;
        }

        line += TYPES[member.modifierType];

        if (member.keyword !== undefined) {
            line += `{${member.keyword}} `;
        }

        line += member.name;

        if (member.type === MEMBER_TYPE.METHOD) {
            line += '(';
            line += member.parameters.map((parameter: ISerializeSymbol): string => {
                return `${parameter.name}: ${parameter.type}`;
            })
                .join(', ');
            line += ')';
        }

        if (member.returnType !== undefined) {
            line += `: ${member.returnType}`;
        }

        return line;
    }

}
