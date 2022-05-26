"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addModCase = exports.getModCase = void 0;
const logs_1 = require("../../models/logs");
async function getModCase() {
    const data = await logs_1.logsModel.findById('substance');
    return data.currentCase;
}
exports.getModCase = getModCase;
async function addModCase() {
    const data = await logs_1.logsModel.findById('substance');
    const currentCase = data.currentCase;
    await logs_1.logsModel.findByIdAndUpdate('substance', {
        $set: { currentCase: currentCase + 1 },
    });
}
exports.addModCase = addModCase;
