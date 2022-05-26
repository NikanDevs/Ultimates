"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.punishmentModel = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const moderation_json_1 = require("../json/moderation.json");
const schema = new mongoose_1.default.Schema({
    _id: String,
    case: Number,
    type: String,
    userId: String,
    moderatorId: String,
    reason: { type: String, default: moderation_json_1.default_config.reason },
    date: Date,
    expire: Date,
});
exports.punishmentModel = mongoose_1.default.model('punishment', schema);
schema.index({ expire: 1 }, { expireAfterSeconds: 0 });
