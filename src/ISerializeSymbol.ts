export interface ISerializeSymbol {
    name: string;
    type: string;
}

export interface ISerializeInterface extends ISerializeSymbol {
    structure: string;
    members: ISerializeMember[];
    extends?: string;
}

export interface ISerializeClass extends ISerializeInterface {
    implements?: string[];
    constructors: Array<{ parameters: ISerializeSymbol[], returnType: string }>;
    keyword?: string
}

export interface ISerializeMember extends ISerializeSymbol {
    modifierType: string;
    returnType?: string;
    parameters: ISerializeSymbol[];
    keyword?: string;
}

export interface ISerializeSignature {
    parameters: ISerializeSymbol[];
    returnType: string;
}
