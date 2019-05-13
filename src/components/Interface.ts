
import * as os from 'os';
import { ComponentKind } from './ComponentKind';
import { IComponentComposite } from './IComponentComposite';
import { Method } from './Method';
import { Property } from './Property';
import { TypeParameter } from './TypeParameter';

/**
 * Represents the metadata for an interface within typescript
 */
export class Interface implements IComponentComposite {
    public componentKind: ComponentKind = ComponentKind.INTERFACE;
    public name: string = '';
    public members: (Method | Property)[] = [];
    public extends: string[] = [];
    public typeParameters: TypeParameter[] = [];
    public toPUML(): string {
        const result: string[] = [];
        const firstLine: string[] = [];
        firstLine.push(`interface ${this.name}`);
        if (this.typeParameters.length > 0) {
            firstLine.push('<');
            firstLine.push(this.typeParameters
                                        .map((typeParameter: TypeParameter): string => typeParameter.toPUML())
                                        .join(', '));
            firstLine.push('>');
        }
        if (this.extends.length > 0) {
            firstLine.push(` extends ${this.extends.join(', ')}`);
        }
        firstLine.push(' {');
        result.push(firstLine.join(''));
        this.members.forEach((member: IComponentComposite): void => {
            result.push(`    ${member.toPUML()}`);
        });
        result.push('}');

        return result.join(os.EOL);
    }
}
