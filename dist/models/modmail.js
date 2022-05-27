"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modmailModel = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    _id: { type: String },
    currentTicket: { type: Number, required: false },
    openedTickets: { type: Array, required: false, default: null },
    moderatorId: { type: String, required: false },
    reason: { type: String, required: false },
    url: { type: String, required: false },
});
exports.modmailModel = mongoose_1.default.model('modmail', schema);
