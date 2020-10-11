
import { tplant } from '../src/tplant';

describe('Parse codes that contains CJK characters', () => {
    it('generate PlantUML for classes that contains CJK characters', () => {
        expect(tplant.convertToPlant(tplant.generateDocumentation(['test/CJK/CJK.ts']), { compositions: false, onlyInterfaces: false }))
            .toEqual(`@startuml
namespace CJK {
    class ChineseCharacters {
        +你好: string
    }
}
class SomeDeal {
    +cjk: CJK.ChineseCharacters
}
@enduml`);
    });
});
