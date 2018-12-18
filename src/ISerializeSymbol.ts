export interface ISerializeSymbol {
    name: string;
    type: string;
}

export interface ISerializeSignature {
    parameters: ISerializeSymbol[];
    returnType: string;
}

export interface ISerializeMember extends ISerializeSymbol, ISerializeSignature {
    modifierType: string;
    keyword?: string;
}

export interface ISerializeInterface extends ISerializeSymbol {
    structure: string;
    members: ISerializeMember[];
    extends?: string;
}

export interface ISerializeClass extends ISerializeInterface {
    implements?: string[];
    constructors: ISerializeSignature[];
    keyword?: string;
}

export enum MODIFIER_TYPE {
    PUBLIC = 'public',
    PRIVATE = 'private',
    PROTECTED = 'protected'
}

export enum MEMBER_TYPE {
    PROPERTY = 'property',
    METHOD = 'method',
    CONSTRUCTOR = 'constructor'
}

export enum KEYWORD_TYPE {
    ABSTRACT = 'abstract',
    STATIC = 'static'
}