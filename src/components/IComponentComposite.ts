
import { ComponentKind } from './ComponentKind';

export interface IComponentComposite {
    componentKind: ComponentKind;
    name: string;
    toPUML(): string;
}
