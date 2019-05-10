
import { Class } from './Class';
import { Enum } from './Enum';
import { Interface } from './Interface';
import { Namespace } from './Namespace';

/**
 * Represents the metadata for a file containing typescript
 */
export class File {
    public parts: (Namespace | Class | Interface | Enum)[] = [];
}
