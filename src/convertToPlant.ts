import * as os from 'os';
import { ISerializeSymbol, ISerializeMember } from './ISerializeSymbol';

const TYPES: { [type: string]: string } = {
    "private": "-",
    "public": "+",
    "protected": "#"
};

export default function convertToPlant(tsjs: any[]): string {

    const lines: string[] = [];

    lines.push("@startuml");

    tsjs.forEach(function (serializedSymbol: any): void {

        let heritage: string = "";

        if (serializedSymbol.extends !== undefined) {
            heritage += " extends " + serializedSymbol.extends;
        }

        if (serializedSymbol.implements !== undefined) {
            heritage += " implements " + serializedSymbol.implements.join(", ");
        }

        lines.push(serializedSymbol.structure + " " + serializedSymbol.name + heritage + " {");

        serializedSymbol.members.forEach(function (serializedMember: ISerializeMember): void {

            let line: string = "\t";

            line += TYPES[serializedMember.modifierType];

            line += serializedMember.name;

            if (serializedMember.type === "method") {
                line += "(";
                line += serializedMember.parameters.map(function (parameter: ISerializeSymbol): string {
                    return parameter.name + ": " + parameter.type;
                }).join(", ");
                line += ")";
            }

            line += ": " + serializedMember.returnType;

            lines.push(line);
        });

        lines.push("}");
    });

    lines.push("@enduml");

    return lines.join(os.EOL);

};
