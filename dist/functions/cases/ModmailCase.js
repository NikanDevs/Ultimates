"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addModmailTicket = exports.getModmailTicket = void 0;
const modmail_1 = require("../../models/modmail");
async function getModmailTicket() {
    const data = await modmail_1.modmailModel.findById('substance');
    return data.currentTicket;
}
exports.getModmailTicket = getModmailTicket;
async function addModmailTicket() {
    const data = await modmail_1.modmailModel.findById('substance');
    const currentTicket = data.currentTicket;
    await modmail_1.modmailModel.findByIdAndUpdate('substance', {
        $set: { currentTicket: currentTicket + 1 },
    });
}
exports.addModmailTicket = addModmailTicket;
