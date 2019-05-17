
import * as os from 'os';
import { Class } from './Class';
import { ComponentKind } from './ComponentKind';
import { Enum } from './Enum';
import { IComponentComposite } from './IComponentComposite';
import { Interface } from './Interface';
import { Namespace } from './Namespace';

/**
 * Represents the metadata for a file containing typescript
 */
export class File implements IComponentComposite {
    public componentKind: ComponentKind = ComponentKind.FILE;
    public name: string = '';
    public parts: IComponentComposite[] = [];
    public toPUML(): string {
        const result: string[] = [];
        this.parts.forEach((part: IComponentComposite): void => {
            result.push(part.toPUML());
        });

        return result.join(os.EOL);
    }
}
