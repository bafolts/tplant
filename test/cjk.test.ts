
import { tplant } from '../src/tplant';

describe('Parse codes that contains CJK characters', () => {
    it('generate PlantUML for classes that contains CJK characters', () => {
        expect(tplant.convertToPlant(
                tplant.generateDocumentation(['test/CJK/CJK.ts']), { associations: false, onlyInterfaces: false })
                .replace(/(?:\r\n)/g, '\n') // windows has \r in line endings
                )
            .toEqual(`@startuml
namespace CJK {
    class ChineseCharacters {
        +你好: string
    }
}
class SomeDeal {
    +cjk: CJK.ChineseCharacters
    +getIt(arg1: CJK.ChineseCharacters): CJK.ChineseCharacters
}
@enduml`);
    });
});
