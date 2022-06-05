"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAutomodId = exports.generateManualId = void 0;
const constants_1 = require("../constants");
function generateManualId() {
    const characters = '1234567890';
    let code = '';
    for (var i = 0; i < constants_1.PUNISHMENT_ID_LENGTH; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}
exports.generateManualId = generateManualId;
function generateAutomodId() {
    const characters = '1234567890';
    let code = '';
    for (var i = 0; i < constants_1.AUTOMOD_ID_LENGTH; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}
exports.generateAutomodId = generateAutomodId;
