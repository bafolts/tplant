
import { IComponentComposite } from './IComponentComposite';

/**
 * Represents the metadata for a type parameter within typescript
 */
export class TypeParameter {
    public name: string = '';
    public constraint: string | undefined;
    public toPUML(): string {
        return `${this.name}${(this.constraint !== undefined ? ` extends ${this.constraint}` : '')}`;
    }
}
