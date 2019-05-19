import * as os from 'os';
import { ComponentKind } from '../Models/ComponentKind';
import { IComponentComposite } from '../Models/IComponentComposite';

/**
 * Represents the metadata for an interface within typescript
 */
export class Interface implements IComponentComposite {
    public readonly componentKind: ComponentKind = ComponentKind.INTERFACE;
    public readonly name: string;
    public members: IComponentComposite[] = [];
    public extendsInterface: string[] = [];
    public typeParameters: IComponentComposite[] = [];

    constructor(name: string) {
        this.name = name;
    }

    public toPUML(): string {
        const result: string[] = [];
        const firstLine: string[] = [];
        firstLine.push(`interface ${this.name}`);
        if (this.typeParameters.length > 0) {
            firstLine.push('<');
            firstLine.push(this.typeParameters
                .map((typeParameter: IComponentComposite): string => typeParameter.toPUML())
                .join(', '));
            firstLine.push('>');
        }
        if (this.extendsInterface.length > 0) {
            firstLine.push(` extends ${this.extendsInterface.join(', ')}`);
        }
        if (this.members.length > 0) {
            firstLine.push(' {');
        }
        result.push(firstLine.join(''));
        this.members.forEach((member: IComponentComposite): void => {
            result.push(`    ${member.toPUML()}`);
        });
        if (this.members.length > 0) {
            result.push('}');
        }

        return result.join(os.EOL);
    }
}
