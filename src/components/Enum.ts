
import { EnumValue } from './EnumValue';

/**
 * Represents the metadata for an Enum within a typescript file.
 */
export class Enum {
    public name: string = '';
    public values: EnumValue[] = [];
}
