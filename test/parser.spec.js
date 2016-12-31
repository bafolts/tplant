
var expect = require("chai").expect;
var typescriptToMeta = require("../src/typescriptToMeta");
var convertToPlant = require("../src/convertToPlant");

describe("parser", function() {

    it("generate plantuml for sample/SubClass", function() {
        expect(
                convertToPlant(typescriptToMeta("sample/SubClass.ts"))
              ).to.equal(
`@startuml
class Test {
	+__constructor: undefined
	+someOtherPublic(): void
	+missingType(): void
	+something: number
	+getSomething(f: number): void
	+setSomething(f: string, a: number, b: Date): void
	-getSomePrivate(): void
	#getSomeProtected(): void
}
interface Interface {
	+someAttribute(): void
	+someProperty: number
	+missingType(): any
}
class SubClass extends Test implements Interface {
}
@enduml`);
   });

});

