import { ComponentKind } from '../Models/ComponentKind';
import { IComponentComposite } from '../Models/IComponentComposite';

/**
 * Represents the metadata for a parameter within typescript
 */
export class Parameter implements IComponentComposite {
    public readonly componentKind: ComponentKind = ComponentKind.PARAMETER;
    public readonly name: string;
    public hasInitializer: boolean = false;
    public isOptional: boolean = false;
    public parameterType: string = 'any';

    constructor(name: string) {
        this.name = name;
    }

    public toPUML(): string {
        return `${this.name}${this.isOptional || this.hasInitializer ? '?' : ''}: ${this.parameterType}`;
    }
}
