import * as os from 'os';
import { ComponentKind } from '../Models/ComponentKind';
import { IComponentComposite } from '../Models/IComponentComposite';

/**
 * Represents the metadata for an Enum within a typescript file.
 */
export class Enum implements IComponentComposite {
    public readonly componentKind: ComponentKind = ComponentKind.ENUM;
    public readonly name: string;
    public values: IComponentComposite[] = [];

    constructor(name: string) {
        this.name = name;
    }

    public toPUML(): string {
        const result: string[] = [];
        let declaration: string = `enum ${this.name}`;
        if (this.values.length > 0) {
            declaration += ' {';
        }
        result.push(declaration);
        this.values.forEach((enumValue: IComponentComposite): void => {
            result.push(`    ${enumValue.toPUML()}`);
        });
        if (this.values.length > 0) {
            result.push('}');
        }

        return result.join(os.EOL);
    }
}
