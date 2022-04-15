import { ComponentKind } from '../Models/ComponentKind';
import { ComponentComposite } from '../Models/IComponentComposite';
import { Modifier } from '../Models/Modifier';

/**
 * Represents the metadata for a property within typescript
 */
export class Property extends ComponentComposite {
    public readonly componentKind: ComponentKind = ComponentKind.PROPERTY;
    public modifier: Modifier = 'public';
    public returnType: string = 'any';
    public isAbstract: boolean = false;
    public isOptional: boolean = false;
    public isReadonly: boolean = false;
    public isStatic: boolean = false;
}
