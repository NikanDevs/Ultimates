"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logsModel = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    _id: String,
    currentCase: Number,
    url: String,
    expire: Date,
});
exports.logsModel = mongoose_1.default.model('logs', schema);
schema.index({ expire: 1 }, { expireAfterSeconds: 60 * 5 });
