"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WEBHOOK_NAMES = exports.MAX_TIMEOUT_DURATION = exports.MIN_TIMEOUT_DURATION = exports.MAX_SOFTBAN_DURATION = exports.MIN_SOFTBAN_DURATION = exports.AUTOMOD_MAX_CAPS = exports.AUTOMOD_MAX_EMOJI_COUNT = exports.AUTOMOD_SPAM_COUNT = exports.AUTOMOD_ID_LENGTH = exports.PUNISHMENT_ID_LENGTH = exports.EMBED_DESCRIPTION_MAX_LENGTH = exports.automodSpamCollection = exports.verificationCollection = exports.punishmentExpiry = exports.warningExpiry = exports.automodPunishmentExpiry = exports.leftMemberExpiry = void 0;
const discord_js_1 = require("discord.js");
// DB expiry calculations.
// 14 days - left member roles data
exports.leftMemberExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
// 1 day - automod punishments
exports.automodPunishmentExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 1);
// 30 days - warnings
exports.warningExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
// 3 months - All punishments
exports.punishmentExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 90);
// Collections
exports.verificationCollection = new discord_js_1.Collection();
exports.automodSpamCollection = new discord_js_1.Collection();
// Other constants
exports.EMBED_DESCRIPTION_MAX_LENGTH = 4096;
exports.PUNISHMENT_ID_LENGTH = 18;
exports.AUTOMOD_ID_LENGTH = 6;
exports.AUTOMOD_SPAM_COUNT = 5;
exports.AUTOMOD_MAX_EMOJI_COUNT = 10;
exports.AUTOMOD_MAX_CAPS = 90; /** % **/
exports.MIN_SOFTBAN_DURATION = 60000; // 1 minute
exports.MAX_SOFTBAN_DURATION = 1000 * 60 * 60 * 24 * 365; // 1 year
exports.MIN_TIMEOUT_DURATION = 10000; // 10 seconds
exports.MAX_TIMEOUT_DURATION = 1000 * 60 * 60 * 24 * 27; // 27 days
var WEBHOOK_NAMES;
(function (WEBHOOK_NAMES) {
    WEBHOOK_NAMES["mod"] = "Mod-Logs";
    WEBHOOK_NAMES["message"] = "Message-Logs";
    WEBHOOK_NAMES["modmail"] = "Modmail-Logs";
    WEBHOOK_NAMES["servergate"] = "Server Gate";
    WEBHOOK_NAMES["error"] = "Errors";
})(WEBHOOK_NAMES = exports.WEBHOOK_NAMES || (exports.WEBHOOK_NAMES = {}));
