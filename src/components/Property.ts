
import { ComponentKind } from './ComponentKind';
import { IComponentComposite } from './IComponentComposite';

/**
 * Represents the metadata for a property within typescript
 */
export class Property implements IComponentComposite {
    public componentKind: ComponentKind = ComponentKind.PROPERTY;
    public name: string = '';
    public modifier: 'public' | 'protected' | 'private' = 'public';
    public returnType: string = '';
    public isOptional: boolean = false;
    public isStatic: boolean = false;
    public toPUML(): string {
        return `${{ public: '+', private: '-', protected: '#' }[this.modifier]}${(this.isStatic ? '{static} ' : '')
                }${this.name}${(this.isOptional ? '?' : '')}: ${this.returnType}`;
    }
}
