import * as os from 'os';
import { ComponentKind } from '../Models/ComponentKind';
import { IComponentComposite } from '../Models/IComponentComposite';

/**
 * Represents the metadata for a file containing typescript
 */
export class File implements IComponentComposite {
    public readonly componentKind: ComponentKind = ComponentKind.FILE;
    public readonly name: string = '';
    public parts: IComponentComposite[] = [];

    public toPUML(): string {
        const result: string[] = [];
        this.parts.forEach((part: IComponentComposite): void => {
            result.push(part.toPUML());
        });

        return result.join(os.EOL);
    }
}
