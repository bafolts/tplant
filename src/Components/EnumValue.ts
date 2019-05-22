import { ComponentKind } from '../Models/ComponentKind';
import { IComponentComposite } from '../Models/IComponentComposite';

/**
 * Represents the metadata for the value or member of an enum within typescript
 */
export class EnumValue implements IComponentComposite {
    public readonly componentKind: ComponentKind = ComponentKind.PROPERTY;
    public readonly name: string;
    public value: string | undefined;

    constructor(name: string) {
        this.name = name;
    }

    public toPUML(): string {
        return this.name;
    }
}
