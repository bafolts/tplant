export interface ISerializeSymbol {
    name: string;
    type: string;
    questionToken?: boolean;
}

export interface ISerializeSignature {
    parameters: ISerializeSymbol[];
    returnType: string;
}

export interface ISerializeMember extends ISerializeSymbol, ISerializeSignature {
    modifierType: string;
    keyword?: string;
    constraint?: string;
}

export interface ISerializeInterface extends ISerializeSymbol {
    structure: STRUCTURE;
    members: ISerializeMember[];
    extends?: string;
    implements?: string[];
    parameters?: ISerializeMember[];
}

export interface ISerializeEnum extends ISerializeInterface {
    structure: STRUCTURE.ENUM;
}

export interface ISerializeClass extends ISerializeInterface {
    structure: STRUCTURE.CLASS;
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
    INDEX = 'index',
    ENUM = 'enum'
}

export enum CLASS_MEMBER_KEYWORD {
    ABSTRACT = 'abstract',
    STATIC = 'static'
}

export enum STRUCTURE {
    CLASS = 'class',
    INTERFACE = 'interface',
    ENUM = 'enum'
}
