import * as os from 'os';
import { ICommandOptions } from './ICommandOptions';
import {
    ISerializeClass,
    ISerializeEnum,
    ISerializeInterface,
    ISerializeMember,
    ISerializeSymbol,
    MEMBER_TYPE,
    MODIFIER_TYPE,
    STRUCTURE
} from './ISerializeSymbol';

const TYPES: { [type: string]: string } = {
    [MODIFIER_TYPE.PRIVATE]: '-',
    [MODIFIER_TYPE.PROTECTED]: '#',
    [MODIFIER_TYPE.PUBLIC]: '+'
};

const COMPOSITION_LINE: string = '*--';

type ISerializeSymbols = ISerializeInterface | ISerializeEnum | ISerializeClass;

// tslint:disable-next-line max-func-body-length
export function convertToPlant(tsjs: ISerializeSymbols[], options: ICommandOptions = {
    compositions: false,
    onlyInterfaces: false
}): string {

    const lines: string[] = [];
    const compositions: string[] = [];
    let listOfSerializeSymbols: ISerializeSymbols[] = tsjs;

    if (options.onlyInterfaces) {
        listOfSerializeSymbols = listOfSerializeSymbols.filter(
            (serializedSymbol: ISerializeSymbols): boolean => serializedSymbol.structure === STRUCTURE.INTERFACE
        );
    }

    lines.push('@startuml');

    listOfSerializeSymbols.forEach((serializedSymbol: ISerializeSymbols): void => {

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
                (parameter: ISerializeMember): string => {
                    if (parameter.constraint === undefined) {
                        return parameter.name;
                    }

                    return `${parameter.name} extends ${parameter.constraint}`;
                })
                .join(', ')}>`;
        }

        let openingBrace: string = '';
        if (serializedSymbol.members.length > 0) {
            openingBrace = ' {';
        }

        lines.push(`${keyword}${serializedSymbol.structure} ${serializedSymbol.name}${parameters}${heritage}${openingBrace}`);

        serializedSymbol.members.forEach((serializedMember: ISerializeMember): void => {
            checkCompositions(serializedMember, serializedSymbol.name);
            lines.push(memberToString(serializedMember, serializedSymbol.name));
        });

        if (serializedSymbol.members.length > 0) {
            lines.push('}');
        }
    });

    if (compositions.length > 0 && options.compositions) {
        const uniqueCompositions: string[] = compositions.filter(
            (value: string, index: number, array: string[]): boolean => array.indexOf(value) === index);
        uniqueCompositions.forEach((composition: string): number => lines.push(composition));
    }

    lines.push('@enduml');

    return lines.join(os.EOL);

    function memberToString(member: ISerializeMember, parentName: string): string {

        let line: string = '    ';

        if (member.type === MEMBER_TYPE.ENUM) {
            return `${line}${member.name}`;
        }

        line += TYPES[member.modifierType];

        if (member.keyword !== undefined) {
            line += `{${member.keyword}} `;
        }

        line += `${member.name}${member.questionToken !== undefined && member.questionToken ? '?' : ''}`;

        if (member.type === MEMBER_TYPE.METHOD) {
            line += `(${member.parameters.map((parameter: ISerializeSymbol): string =>
                `${parameter.name}${parameter.questionToken !== undefined && parameter.questionToken ? '?' : ''}: ${parameter.type}`)
                .join(', ')})`;
        }

        if (member.returnType !== undefined) {
            line += `: ${member.returnType}`;
        }

        return line;
    }

    function checkCompositions(member: ISerializeMember, parentName: string): void {
        listOfSerializeSymbols.some((serializedSymbolToSearch: ISerializeSymbol): boolean => {
            if (parentName === serializedSymbolToSearch.name) {
                return false;
            }

            const memberTypeIndex: number = member.type.split(' | ')
                .indexOf(serializedSymbolToSearch.name);
            const memberReturnTypeIndex: number = member.returnType.split(' | ')
                .indexOf(serializedSymbolToSearch.name);

            const memberParameterTypes: string[] = [];
            member.parameters.forEach((parameter: ISerializeSymbol): number => memberParameterTypes.push(...parameter.type.split(' | ')));
            const memberParamterTypesIndex: number = memberParameterTypes.indexOf(serializedSymbolToSearch.name);

            if (memberTypeIndex < 0 && memberReturnTypeIndex < 0 && memberParamterTypesIndex < 0) {
                return false;
            }

            compositions.push(`${parentName} ${COMPOSITION_LINE} ${serializedSymbolToSearch.name}`);

            return true;
        });
    }

}
