
var expect = require("chai").expect;
var typescriptToMeta = require("../src/typescriptToMeta");

describe("typescriptToMeta", function() {

    it("generate meta for sample/SubClass", function() {
        var meta = typescriptToMeta("sample/SubClass.ts");
        expect(meta.length).to.equal(3);
        var classMeta = meta[0];
        var interfaceSpec = meta[1];
        var subclassMeta = meta[2];
        expect(classMeta.name).to.equal("Test");
        expect(classMeta.structure).to.equal("class");
        expect(classMeta.members.length).to.equal(6);
        expect(interfaceSpec.name).to.equal("Interface");
        expect(interfaceSpec.structure).to.equal("interface");
        expect(interfaceSpec.members.length).to.equal(2);
        expect(subclassMeta.name).to.equal("SubClass");
        expect(subclassMeta.structure).to.equal("class");
        expect(subclassMeta.extends).to.equal("Test");
        expect(subclassMeta.implements.length).to.equal(1);
        expect(subclassMeta.implements[0]).to.equal("Interface");
        expect(subclassMeta.members.length).to.equal(0);
        expect(classMeta.members[0].name).to.equal("someOtherPublic");
        expect(classMeta.members[0].type).to.equal("method");
        expect(classMeta.members[0].modifierType).to.equal("public");
        expect(classMeta.members[0].returnType).to.equal("void");
        expect(classMeta.members[0].parameters.length).to.equal(0);
        expect(classMeta.members[1].name).to.equal("something");
        expect(classMeta.members[1].type).to.equal("property");
        expect(classMeta.members[1].modifierType).to.equal("public");
        expect(classMeta.members[1].returnType).to.equal("number");
        expect(classMeta.members[1].parameters).to.be.undefined;
        expect(classMeta.members[2].name).to.equal("getSomething");
        expect(classMeta.members[2].type).to.equal("method");
        expect(classMeta.members[2].modifierType).to.equal("public");
        expect(classMeta.members[2].returnType).to.equal("void");
        expect(classMeta.members[2].parameters.length).to.equal(1);
        expect(classMeta.members[2].parameters[0].name).to.equal("f");
        expect(classMeta.members[2].parameters[0].type).to.equal("number");
        expect(classMeta.members[3].name).to.equal("setSomething");
        expect(classMeta.members[3].type).to.equal("method");
        expect(classMeta.members[3].modifierType).to.equal("public");
        expect(classMeta.members[3].returnType).to.equal("void");
        expect(classMeta.members[3].parameters.length).to.equal(3);
        expect(classMeta.members[3].parameters[0].name).to.equal("f");
        expect(classMeta.members[3].parameters[0].type).to.equal("string");
        expect(classMeta.members[3].parameters[1].name).to.equal("a");
        expect(classMeta.members[3].parameters[1].type).to.equal("number");
        expect(classMeta.members[3].parameters[2].name).to.equal("b");
        expect(classMeta.members[3].parameters[2].type).to.equal("Date");
        expect(classMeta.members[4].name).to.equal("getSomePrivate");
        expect(classMeta.members[4].type).to.equal("method");
        expect(classMeta.members[4].modifierType).to.equal("private");
        expect(classMeta.members[4].returnType).to.equal("void");
        expect(classMeta.members[4].parameters.length).to.equal(0);
        expect(classMeta.members[5].name).to.equal("getSomeProtected");
        expect(classMeta.members[5].type).to.equal("method");
        expect(classMeta.members[5].modifierType).to.equal("protected");
        expect(classMeta.members[5].returnType).to.equal("void");
        expect(classMeta.members[5].parameters.length).to.equal(0);
    });

});

