import { ComponentKind } from '../Models/ComponentKind';
import { ComponentComposite } from '../Models/IComponentComposite';

/**
 * Represents the metadata for a parameter within typescript
 */
export class Parameter extends ComponentComposite {
    public readonly componentKind: ComponentKind = ComponentKind.PARAMETER;
    public hasInitializer: boolean = false;
    public isOptional: boolean = false;
    public parameterType: string = 'any';
    public parameterTypeFile: string = '';

}
