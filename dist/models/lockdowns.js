"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lockdownsModel = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    type: String,
    channelId: String,
    messageId: String,
    messagesArray: Array,
});
exports.lockdownsModel = mongoose_1.default.model('lockdowns', schema);
