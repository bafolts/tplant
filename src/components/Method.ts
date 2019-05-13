
import { ComponentKind } from './ComponentKind';
import { IComponentComposite } from './IComponentComposite';
import { Parameter } from './Parameter';

/**
 * Represents the metadata for a method within typescript
 */
export class Method implements IComponentComposite {
    public componentKind: ComponentKind = ComponentKind.METHOD;
    public name: string = '';
    public parameters: Parameter[] = [];
    public returnType: string = '';
    public modifier: 'public' | 'protected' | 'private' = 'public';
    public isAbstract: boolean = false;
    public isOptional: boolean = false;
    public isStatic: boolean = false;
    public toPUML(): string {
        let result: string = { public: '+', private: '-', protected: '#' }[this.modifier];
        result += (this.isAbstract ? '{abstract} ' : '');
        result += (this.isStatic ? '{static} ' : '');
        result += `${this.name}(`;
        result += this.parameters
                    .map((parameter: Parameter): string => parameter.toPUML())
                    .join(', ');
        result += `): ${this.returnType}`;

        return result;
    }
}
