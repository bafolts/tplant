import { ComponentKind } from '../Models/ComponentKind';
import { IComponentComposite } from '../Models/IComponentComposite';

/**
 * Represents the metadata for a type parameter within typescript
 */
export class TypeParameter implements IComponentComposite {
    public readonly componentKind: ComponentKind = ComponentKind.PARAMETER;
    public readonly name: string;
    public constraint: string | undefined;

    constructor(name: string) {
        this.name = name;
    }

    public toPUML(): string {
        return `${this.name}${(this.constraint !== undefined ? ` extends ${this.constraint}` : '')}`;
    }
}
