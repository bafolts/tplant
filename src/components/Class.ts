
import * as os from 'os';
import { ComponentKind } from './ComponentKind';
import { IComponentComposite } from './IComponentComposite';
import { Interface } from './Interface';
import { Method } from './Method';
import { Property } from './Property';
import { TypeParameter } from './TypeParameter';

/**
 * Represents the metadata for a class within a typescript file.
 */
export class Class implements IComponentComposite {
    public componentKind: ComponentKind = ComponentKind.CLASS;
    public name: string = '';
    public isAbstract: boolean = false;
    public isStatic: boolean = false;
    public constructorMethods: Method[] = [];
    public members: (Method | Property)[] = [];
    public extendsClass: string = '';
    public implementsInterfaces: string[] = [];
    public typeParameters: TypeParameter[] = [];
    public toPUML(): string {
        const result: string[] = [];
        const firstLine: string[] = [];
        if (this.isAbstract) {
            firstLine.push('abstract ');
        }
        firstLine.push(`class ${this.name}`);
        if (this.typeParameters.length > 0) {
            firstLine.push('<');
            firstLine.push(this.typeParameters
                                    .map((typeParameter: TypeParameter): string => typeParameter.toPUML())
                                    .join(', '));
            firstLine.push('>');
        }
        if (this.extendsClass !== '') {
            firstLine.push(` extends ${this.extendsClass}`);
        }
        if (this.implementsInterfaces.length > 0) {
            firstLine.push(` implements ${this.implementsInterfaces.join(', ')}`);
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
