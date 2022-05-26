"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDiscordTimestamp = void 0;
function generateDiscordTimestamp(date, type) {
    type ? type : (type = 'Relative Time');
    let unix;
    (function (unix) {
        unix["Short Time"] = "t";
        unix["Long Time"] = "T";
        unix["Short Date"] = "d";
        unix["Long Date"] = "D";
        unix["Short Date/Time"] = "f";
        unix["Long Date/Time"] = "F";
        unix["Relative Time"] = "R";
    })(unix || (unix = {}));
    return `<t:${Math.floor(date.getTime() / 1000)}:${unix[type]}>`;
}
exports.generateDiscordTimestamp = generateDiscordTimestamp;
