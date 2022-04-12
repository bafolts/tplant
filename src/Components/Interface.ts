import { ComponentKind } from '../Models/ComponentKind';
import { ComponentComposite, IComponentComposite } from '../Models/IComponentComposite';

/**
 * Represents the metadata for an interface within typescript
 */
export class Interface extends ComponentComposite {
    public readonly componentKind: ComponentKind = ComponentKind.INTERFACE;
    public members: IComponentComposite[] = [];
    public extendsInterface: string[] = [];
    public extendsInterfaceFiles: string[] = [];
    public typeParameters: IComponentComposite[] = [];
}
