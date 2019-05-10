
/**
 * Represents the metadata for a property within typescript
 */
export class Property {
    public name: string = '';
    public modifier: 'public' | 'protected' | 'private' = 'public';
    public returnType: string = '';
    public isOptional: boolean = false;
    public isStatic: boolean = false;
}
