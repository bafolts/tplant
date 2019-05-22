import { ComponentKind } from './ComponentKind';

export interface IComponentComposite {
    readonly componentKind: ComponentKind;
    readonly name: string;
    toPUML(): string;
}
