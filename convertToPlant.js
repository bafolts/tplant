
var os = require("os");

var TYPES = {
    "private": "-",
    "public": "+",
    "protected": "#"
};

module.exports = function (tsjs) {

    var lines = [];

    lines.push("@startuml");

    tsjs.forEach(function (c) {

        lines.push("class " + c.name + " {");

        c.members.forEach(function (m) {

            var line = "\t";

            line += TYPES[m.modifierType];

            line += m.name;

            if (m.type === "method") {
                line += "(";
                line += m.parameters.map(function (parameter) {
                    return parameter.name + ": " + parameter.type;
                }).join(", ");
                line += ")";
            }

            line += ": " + m.returnType;

            lines.push(line);
        }); 

        lines.push("}");
    });

    tsjs.forEach(function (c) {
        if (c.extends) {
            lines.push(c.name + " --|> " + c.extends);
        }
        if (c.implements) {
            c.implements.forEach(function (implement) {
                lines.push(c.name + " --|> " + implement);
            });
        }
    });

    lines.push("@enduml");

    console.log(lines.join(os.EOL));

};

