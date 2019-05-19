import { ComponentKind } from '../Models/ComponentKind';
import { IComponentComposite } from '../Models/IComponentComposite';
import { Modifier } from '../Models/Modifier';

/**
 * Represents the metadata for a method within typescript
 */
export class Method implements IComponentComposite {
    public readonly componentKind: ComponentKind = ComponentKind.METHOD;
    public readonly name: string;
    public parameters: IComponentComposite[] = [];
    public returnType: string = 'any';
    public modifier: Modifier = 'public';
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
        result += `${this.name}(`;
        result += this.parameters
            .map((parameter: IComponentComposite): string => parameter.toPUML())
            .join(', ');
        result += `): ${this.returnType}`;

        return result;
    }
}
