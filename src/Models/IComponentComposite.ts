import { ComponentKind } from './ComponentKind';

export interface IComponentComposite {
    readonly componentKind: ComponentKind;
    readonly name: string;
}

/**
 * Abstract class for component
 */
export abstract class ComponentComposite implements IComponentComposite {
    public abstract readonly componentKind: ComponentKind;
    public readonly name: string;

    constructor(name: string) {
        this.name = name;
    }
}
