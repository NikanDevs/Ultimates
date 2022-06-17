"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.automodModel = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const __1 = require("..");
const schema = new mongoose_1.default.Schema({
    _id: String,
    case: Number,
    type: String,
    userId: String,
    reason: { type: String, default: __1.client.config.moderation.default.reason },
    date: Date,
    expire: Date,
});
schema.index({ expire: 1 }, { expireAfterSeconds: 0 });
exports.automodModel = mongoose_1.default.model('automod', schema);
