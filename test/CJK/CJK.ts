namespace CJK {
    /**
     * ChineseCharacters
     *
     * Some classes might contains some Chinese characters
     */
    export class ChineseCharacters {
        public 你好: string = '';
    }
}

class SomeDeal {
    public cjk: CJK.ChineseCharacters;
    public getIt(arg1: CJK.ChineseCharacters): CJK.ChineseCharacters;
}

