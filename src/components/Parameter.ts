
import { ComponentKind } from './ComponentKind';
import { IComponentComposite } from './IComponentComposite';

/**
 * Represents the metadata for a parameter within typescript
 */
export class Parameter implements IComponentComposite {
    public componentKind: ComponentKind = ComponentKind.PARAMETER;
    public name: string = '';
    public hasInitializer: boolean = false;
    public isOptional: boolean = false;
    public type: string = '';
    public toPUML(): string {
        return `${this.name}${this.isOptional || this.hasInitializer ? '?' : ''}: ${this.type}`;
    }
}
