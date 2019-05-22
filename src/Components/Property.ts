import { ComponentKind } from '../Models/ComponentKind';
import { IComponentComposite } from '../Models/IComponentComposite';
import { Modifier } from '../Models/Modifier';

/**
 * Represents the metadata for a property within typescript
 */
export class Property implements IComponentComposite {
    public readonly componentKind: ComponentKind = ComponentKind.PROPERTY;
    public readonly name: string;
    public modifier: Modifier = 'public';
    public returnType: string = 'any';
    public isOptional: boolean = false;
    public isStatic: boolean = false;

    constructor(name: string) {
        this.name = name;
    }

    public toPUML(): string {
        return `${{ public: '+', private: '-', protected: '#' }[this.modifier]}${(this.isStatic ? '{static} ' : '')
            }${this.name}${(this.isOptional ? '?' : '')}: ${this.returnType}`;
    }
}
