interface FirstGeneric<T> {
    index: T
}

interface SecondGeneric<T> {
    index: T
}

interface ThirdGeneric<T> {
    index: T
}

interface NormalInterface {
    index: any;
}

interface NormalInterface_2 {
    index: any;
}

interface RecursiveGenericType {
    recursiveGenericType: string | FirstGeneric<SecondGeneric<ThirdGeneric<NormalInterface> | NormalInterface_2>> | number;
}