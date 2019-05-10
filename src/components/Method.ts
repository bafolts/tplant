
import { Parameter } from './Parameter';

/**
 * Represents the metadata for a method within typescript
 */
export class Method {
    public name: string = '';
    public parameters: Parameter[] = [];
    public returnType: string = '';
    public modifier: 'public' | 'protected' | 'private' = 'public';
    public isAbstract: boolean = false;
    public isOptional: boolean = false;
    public isStatic: boolean = false;
}
