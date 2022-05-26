"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.durationsModel = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    case: Number,
    type: String,
    userId: String,
    date: Date,
    duration: Number,
});
exports.durationsModel = mongoose_1.default.model('durations', schema);
