import { ComponentKind } from '../Models/ComponentKind';
import { ComponentComposite, IComponentComposite } from '../Models/IComponentComposite';
import { Modifier } from '../Models/Modifier';

/**
 * Represents the metadata for a method within typescript
 */
export class Method extends ComponentComposite {
    public readonly componentKind: ComponentKind = ComponentKind.METHOD;
    public parameters: IComponentComposite[] = [];
    public typeParameters: IComponentComposite[] = [];
    public returnType: string = 'any';
    public returnTypeFile: string = '';
    public modifier: Modifier = 'public';
    public isAbstract: boolean = false;
    public isAsync: boolean = false;
    public isOptional: boolean = false;
    public isStatic: boolean = false;
}
