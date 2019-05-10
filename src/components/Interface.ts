
import { Method } from './Method';
import { Property } from './Property';
import { TypeParameter } from './TypeParameter';

/**
 * Represents the metadata for an interface within typescript
 */
export class Interface {
    public name: string = '';
    public members: (Method | Property)[] = [];
    public extends: string[] = [];
    public typeParameters: TypeParameter[] = [];
}
