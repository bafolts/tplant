import { ComponentKind } from '../Models/ComponentKind';
import { ComponentComposite } from '../Models/IComponentComposite';

/**
 * Represents the metadata for a type parameter within typescript
 */
export class TypeParameter extends ComponentComposite {
    public readonly componentKind: ComponentKind = ComponentKind.PARAMETER;
    public constraint: string | undefined;
    public constraintFile: string | undefined;
}
