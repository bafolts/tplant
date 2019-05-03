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
    structure: STRUCTURE;
    members: ISerializeMember[];
    extends?: string;
    parameters?: ISerializeMember[];
}

export interface ISerializeEnum extends ISerializeSymbol {
    structure: STRUCTURE;
    members: string[];
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
    CONSTRUCTOR = 'constructor',
    INDEX = 'index'
}

export enum KEYWORD_TYPE {
    ABSTRACT = 'abstract',
    STATIC = 'static'
}

export enum STRUCTURE {
    CLASS = 'class',
    INTERFACE = 'interface',
    ENUM = 'enum'
}
