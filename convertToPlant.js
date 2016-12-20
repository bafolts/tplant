
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

    lines.push("@enduml");

    console.log(lines.join(os.EOL));

};

