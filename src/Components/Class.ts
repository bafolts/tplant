import * as os from 'os';
import { ComponentKind } from '../Models/ComponentKind';
import { IComponentComposite } from '../Models/IComponentComposite';

/**
 * Represents the metadata for a class within a typescript file.
 */
export class Class implements IComponentComposite {
    public readonly componentKind: ComponentKind = ComponentKind.CLASS;
    public readonly name: string;
    public isAbstract: boolean = false;
    public isStatic: boolean = false;
    public constructorMethods: IComponentComposite[] = [];
    public members: IComponentComposite[] = [];
    public extendsClass: string | undefined;
    public implementsInterfaces: string[] = [];
    public typeParameters: IComponentComposite[] = [];

    constructor(name: string) {
        this.name = name;
    }

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
                .map((typeParameter: IComponentComposite): string => typeParameter.toPUML())
                .join(', '));
            firstLine.push('>');
        }
        if (this.extendsClass !== undefined) {
            firstLine.push(` extends ${this.extendsClass}`);
        }
        if (this.implementsInterfaces.length > 0) {
            firstLine.push(` implements ${this.implementsInterfaces.join(', ')}`);
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
