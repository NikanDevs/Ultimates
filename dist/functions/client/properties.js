"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientEmbeds = exports.cc = void 0;
const discord_js_1 = require("discord.js");
const database_json_1 = require("../../json/database.json");
const __1 = require("../..");
exports.cc = {
    errorC: discord_js_1.Colors.Red,
    successC: discord_js_1.Colors.Green,
    ultimates: discord_js_1.Util.resolveColor('#fcc603'),
    attentionC: discord_js_1.Colors.Yellow,
    invisible: discord_js_1.Util.resolveColor('#2F3136'),
    moderation: discord_js_1.Util.resolveColor('#dbca95'),
    successE: database_json_1.emojis.sucess,
    errorE: database_json_1.emojis.error,
    attentionE: database_json_1.emojis.attention,
    previous: '◀️',
    next: '▶️',
};
exports.clientEmbeds = {
    error: function name(error) {
        const embed = new discord_js_1.EmbedBuilder()
            .setDescription(exports.cc.errorE + ' ' + error)
            .setColor(discord_js_1.Util.resolveColor('Red'));
        return embed;
    },
    attention: function (message) {
        const embed = new discord_js_1.EmbedBuilder()
            .setDescription(exports.cc.attentionE + ' ' + message)
            .setColor(discord_js_1.Util.resolveColor('#f0e17c'));
        return embed;
    },
    success: function (message) {
        const embed = new discord_js_1.EmbedBuilder()
            .setDescription(exports.cc.successE + ' ' + message)
            .setColor(discord_js_1.Util.resolveColor('#9eea9a'));
        return embed;
    },
    moderation: function (user, options) {
        let pastForm;
        (function (pastForm) {
            pastForm["WARN"] = "warned";
            pastForm["BAN"] = "banned";
            pastForm["KICK"] = "kicked";
            pastForm["TIMEOUT"] = "timed out";
            pastForm["UNBAN"] = "unbanned";
            pastForm["SOFTBAN"] = "soft banned";
        })(pastForm || (pastForm = {}));
        const embed = new discord_js_1.EmbedBuilder()
            .setDescription(`${user} was **${pastForm[options['action']]}**  • ID: \`${options['id']}\``)
            .setColor(__1.client.cc.moderation);
        return embed;
    },
};
