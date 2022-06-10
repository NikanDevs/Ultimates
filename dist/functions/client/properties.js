"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientEmbeds = exports.cc = void 0;
const discord_js_1 = require("discord.js");
const __1 = require("../..");
exports.cc = {
    errorC: discord_js_1.Colors.Red,
    successC: discord_js_1.Colors.Green,
    ultimates: discord_js_1.Util.resolveColor('#fcc603'),
    attentionC: discord_js_1.Colors.Yellow,
    invisible: discord_js_1.Util.resolveColor('#2F3136'),
    moderation: discord_js_1.Util.resolveColor('#dbca95'),
    previous: '◀️',
    next: '▶️',
};
exports.clientEmbeds = {
    success: function (message) {
        const embed = new discord_js_1.EmbedBuilder()
            .setDescription(__1.client.config.general.success + ' ' + message)
            .setColor(discord_js_1.Util.resolveColor('#9eea9a'));
        return embed;
    },
    attention: function (message) {
        const embed = new discord_js_1.EmbedBuilder()
            .setDescription(__1.client.config.general.attention + ' ' + message)
            .setColor(discord_js_1.Util.resolveColor('#f0e17c'));
        return embed;
    },
    error: function name(error) {
        const embed = new discord_js_1.EmbedBuilder()
            .setDescription(__1.client.config.general.error + ' ' + error)
            .setColor(discord_js_1.Util.resolveColor('Red'));
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
            .setDescription(`${discord_js_1.Formatters.bold(user.toString())} was ${pastForm[options['action']]}  • ID: \`${options['id']}\``)
            .setColor(__1.client.cc.moderation);
        return embed;
    },
};
