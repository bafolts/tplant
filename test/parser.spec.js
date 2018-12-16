var assert = require('assert');
var typescriptToMeta = require("../src/typescriptToMeta");
var convertToPlant = require("../src/convertToPlant");

describe("parser", function () {

	it("generate plantuml for sample/SubClass", function () {
		assert.equal(convertToPlant(typescriptToMeta("sample/SubClass.ts")),
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
