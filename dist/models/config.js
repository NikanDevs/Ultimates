"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configModel = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    _id: String,
    // General
    ownerId: { type: String, required: false },
    developers: { type: Object, required: false },
    success: { type: String, required: false },
    error: { type: String, required: false },
    attention: { type: String, required: false },
    guild: { type: Object, required: false },
    // Automod
    filteredWords: { type: Array, required: false },
    modules: { type: Object, required: false },
    // Logging
    logging: { type: Object },
});
exports.configModel = mongoose_1.default.model('config', schema);
