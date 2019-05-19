import * as os from 'os';
import { ComponentKind } from '../Models/ComponentKind';
import { IComponentComposite } from '../Models/IComponentComposite';

/**
 * Represents the metadata for a namespace within typescript
 */
export class Namespace implements IComponentComposite {
    public readonly name: string;
    public readonly componentKind: ComponentKind = ComponentKind.NAMESPACE;
    public parts: IComponentComposite[] = [];

    constructor(name: string) {
        this.name = name;
    }

    public toPUML(): string {
        const result: string[] = [];
        result.push(`namespace ${this.name}`);
        if (this.parts.length > 0) {
            result.push(' {');
        }
        this.parts.forEach((part: IComponentComposite): void => {
            result.push(part.toPUML());
        });
        if (this.parts.length > 0) {
            result.push(' {');
        }

        return result.join(os.EOL);
    }
}
