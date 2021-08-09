import { ComponentKind } from '../Models/ComponentKind';
import { ComponentComposite, IComponentComposite } from '../Models/IComponentComposite';

/**
 * Represents the metadata for a class within a typescript file.
 */
export class Class extends ComponentComposite {
    public readonly componentKind: ComponentKind = ComponentKind.CLASS;
    public isAbstract: boolean = false;
    public isStatic: boolean = false;
    public constructorMethods: IComponentComposite[] = [];
    public members: IComponentComposite[] = [];
    public extendsClass: string | undefined;
    public implementsInterfaces: string[] = [];
    public typeParameters: IComponentComposite[] = [];

}
