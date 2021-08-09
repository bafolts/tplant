import { ComponentKind } from '../Models/ComponentKind';
import { ComponentComposite, IComponentComposite } from '../Models/IComponentComposite';

/**
 * Represents the metadata for a namespace within typescript
 */
export class Namespace extends ComponentComposite {
    public readonly componentKind: ComponentKind = ComponentKind.NAMESPACE;
    public parts: IComponentComposite[] = [];
}
