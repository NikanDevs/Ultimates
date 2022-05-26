"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAutomodId = exports.generateManualId = void 0;
const moderation_json_1 = require("../json/moderation.json");
function generateManualId() {
    const characters = '1234567890';
    let code = '';
    for (var i = 0; i < moderation_json_1.lengths['manual-id']; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}
exports.generateManualId = generateManualId;
function generateAutomodId() {
    const characters = '1234567890';
    let code = '';
    for (var i = 0; i < moderation_json_1.lengths['automod-id']; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}
exports.generateAutomodId = generateAutomodId;
