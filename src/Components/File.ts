import { ComponentKind } from '../Models/ComponentKind';
import { IComponentComposite } from '../Models/IComponentComposite';

/**
 * Represents the metadata for a file containing typescript
 */
export class File implements IComponentComposite {
    public readonly componentKind: ComponentKind = ComponentKind.FILE;
    public readonly name: string = '';
    public parts: IComponentComposite[] = [];
}
