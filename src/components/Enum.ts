
import * as os from 'os';
import { ComponentKind } from './ComponentKind';
import { EnumValue } from './EnumValue';
import { IComponentComposite } from './IComponentComposite';

/**
 * Represents the metadata for an Enum within a typescript file.
 */
export class Enum implements IComponentComposite {
    public componentKind: ComponentKind = ComponentKind.ENUM;
    public name: string = '';
    public values: EnumValue[] = [];
    public toPUML(): string {
        const result: string[] = [];
        result.push(`enum ${this.name} {`);
        this.values.forEach((enumValue: EnumValue): void => {
            result.push(`    ${enumValue.name}`);
        });
        result.push('}');

        return result.join(os.EOL);
    }
}
