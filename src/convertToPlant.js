"use strict";

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

        let heritage = "";

        if (c.extends) {
            heritage += " extends " + c.extends;
        }

        if (c.implements) {
            heritage += " implements " + c.implements.join(", ");
        }

        lines.push(c.structure + " " + c.name + heritage + " {");

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

    return lines.join(os.EOL);

};

