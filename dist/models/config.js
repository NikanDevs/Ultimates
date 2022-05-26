"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configModel = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    _id: String,
    mod: { type: Object },
    message: { type: Object },
    modmail: { type: Object },
    servergate: { type: Object },
    error: { type: Object },
});
exports.configModel = mongoose_1.default.model('config', schema);
