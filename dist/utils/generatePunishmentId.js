"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAutomodId = exports.generateManualId = void 0;
const constants_1 = require("../constants");
const automod_1 = require("../models/automod");
const punishments_1 = require("../models/punishments");
const characters = '1234567890';
async function generateManualId() {
    let code = '';
    let exist = true;
    while (exist) {
        code = '';
        for (var i = 0; i < constants_1.PUNISHMENT_ID_LENGTH; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        exist = (await punishments_1.punishmentModel.findById(code)) ? true : false;
    }
    return code;
}
exports.generateManualId = generateManualId;
async function generateAutomodId() {
    let code = '';
    let exist = true;
    while (exist) {
        code = '';
        for (var i = 0; i < constants_1.AUTOMOD_ID_LENGTH; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        exist = (await automod_1.automodModel.findById(code)) ? true : false;
    }
    return code;
}
exports.generateAutomodId = generateAutomodId;
