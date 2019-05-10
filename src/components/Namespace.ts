
import { Class } from './Class';
import { Interface } from './Interface';

/**
 * Represents the metadata for a namespace within typescript
 */
export class Namespace {
    public classes: Class[] = [];
    public interfaces: Interface[] = [];
    public namespaces: Namespace[] = [];
}
