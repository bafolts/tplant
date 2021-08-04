import { ComponentKind } from '../Models/ComponentKind';
import { ComponentComposite, IComponentComposite } from '../Models/IComponentComposite';

/**
 * Represents the metadata for an Enum within a typescript file.
 */
export class Enum extends ComponentComposite {
    public readonly componentKind: ComponentKind = ComponentKind.ENUM;
    public values: IComponentComposite[] = [];
}
