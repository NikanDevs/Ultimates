"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addModmailCase = exports.getModmailCase = void 0;
const modmail_1 = require("../../models/modmail");
async function getModmailCase() {
    const data = await modmail_1.modmailModel.findById('substance');
    return data.currentTicket;
}
exports.getModmailCase = getModmailCase;
async function addModmailCase() {
    const data = await modmail_1.modmailModel.findById('substance');
    const currentTicket = data.currentTicket;
    await modmail_1.modmailModel.findByIdAndUpdate('substance', {
        $set: { currentTicket: currentTicket + 1 },
    });
}
exports.addModmailCase = addModmailCase;
