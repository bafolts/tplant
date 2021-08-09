import { ComponentKind } from '../Models/ComponentKind';
import { ComponentComposite } from '../Models/IComponentComposite';

/**
 * Represents the metadata for the value or member of an enum within typescript
 */
export class EnumValue extends ComponentComposite {
    public readonly componentKind: ComponentKind = ComponentKind.PROPERTY;
    public value: string | undefined;
}
