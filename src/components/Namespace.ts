
import * as os from 'os';
import { Class } from './Class';
import { ComponentKind } from './ComponentKind';
import { Enum } from './Enum';
import { IComponentComposite } from './IComponentComposite';
import { Interface } from './Interface';
import { Method } from './Method';
import { Property } from './Property';

/**
 * Represents the metadata for a namespace within typescript
 */
export class Namespace implements IComponentComposite {
    public name: string = '';
    public componentKind: ComponentKind = ComponentKind.NAMESPACE;
    public parts: (Enum | Class | Interface | Namespace | Property | Method)[] = [];
    public toPUML(): string {
        const result: string[] = [];
        result.push(`namespace ${this.name} {`);
        this.parts.forEach((part: IComponentComposite): void => {
            result.push(part.toPUML());
        });
        result.push(`}`);

        return result.join(os.EOL);
    }
}
