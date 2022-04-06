import { ComponentKind } from '../Models/ComponentKind';
import { ComponentComposite, IComponentComposite } from '../Models/IComponentComposite';

/**
 * Represents the metadata for a file containing typescript
 */
export class File extends ComponentComposite {
    public readonly componentKind: ComponentKind = ComponentKind.FILE;
    public parts: IComponentComposite[] = [];
}
