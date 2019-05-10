
import { Interface } from './Interface';
import { Method } from './Method';
import { Property } from './Property';
import { TypeParameter } from './TypeParameter';

/**
 * Represents the metadata for a class within a typescript file.
 */
export class Class {
    public name: string = '';
    public isAbstract: boolean = false;
    public isStatic: boolean = false;
    public constructorMethods: Method[] = [];
    public members: (Method | Property)[] = [];
    public extendsClass: string = '';
    public implementsInterfaces: string[] = [];
    public typeParameters: TypeParameter[] = [];
}
