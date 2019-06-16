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
    public isAbstract: boolean = false;
    public isOptional: boolean = false;
    public isStatic: boolean = false;

    constructor(name: string) {
        this.name = name;
    }

    public toPUML(): string {
        let result: string = { public: '+', private: '-', protected: '#' }[this.modifier];
        result += (this.isAbstract ? '{abstract} ' : '');
        result += (this.isStatic ? '{static} ' : '');
        result += `${this.name}${(this.isOptional ? '?' : '')}: ${this.returnType}`;

        return result;
    }
}
