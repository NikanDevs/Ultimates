"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leftMembersModel = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    userId: String,
    roles: Array,
    expire: Date,
});
exports.leftMembersModel = mongoose_1.default.model('left-members', schema);
schema.index({ expire: 1 }, { expireAfterSeconds: 0 });
