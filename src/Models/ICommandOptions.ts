export interface ICommandOptions {
    targetClass?: string;
    associations: boolean;
    onlyInterfaces: boolean;
    format?: string;
    onlyClasses: boolean;
    customization?: string;  // optional customization file (plantuml include file)
}
