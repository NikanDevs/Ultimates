"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientEmbeds = exports.clientCc = exports.databaseConfig = exports.clientServer = exports.clientColors = void 0;
const discord_js_1 = require("discord.js");
const database_json_1 = require("../../json/database.json");
const __1 = require("../..");
const config_json_1 = require("../../json/config.json");
exports.clientColors = {
    error: discord_js_1.Colors.Red,
    success: discord_js_1.Colors.Green,
    ultimates: discord_js_1.Util.resolveColor('#fcc603'),
    wait: discord_js_1.Colors.Yellow,
    invisible: discord_js_1.Util.resolveColor('#2F3136'),
    moderation: discord_js_1.Util.resolveColor('#dbca95'),
};
exports.clientServer = {
    id: config_json_1.guildId,
    dev: '869805946854068281',
    invite: `https://discord.gg/4HX9RneUjt`,
    appeal: 'https://forms.gle/dW8RGLA65ycC4vcM7',
    verificationChannel: '912572618308210708',
};
exports.databaseConfig = {
    logsActive: {
        mod: null,
        message: null,
        modmail: null,
        servergate: null,
    },
};
exports.clientCc = {
    cannotInteract: {
        content: "You can't use this!",
        ephemeral: true,
    },
    success: database_json_1.emojis.sucess,
    error: database_json_1.emojis.error,
    attention: database_json_1.emojis.attention,
    previous: '◀️',
    next: '▶️',
};
exports.clientEmbeds = {
    error: function name(error) {
        const embed = __1.client.util
            .embed()
            .setDescription(exports.clientCc.error + ' ' + error)
            .setColor(discord_js_1.Util.resolveColor('Red'));
        return embed;
    },
    attention: function (message) {
        const embed = __1.client.util
            .embed()
            .setDescription(exports.clientCc.attention + ' ' + message)
            .setColor(discord_js_1.Util.resolveColor('#f0e17c'));
        return embed;
    },
    success: function (message) {
        const embed = __1.client.util
            .embed()
            .setDescription(exports.clientCc.success + ' ' + message)
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
        const embed = __1.client.util
            .embed()
            .setDescription(`${user} was **${pastForm[options['action']]}**  • ID: \`${options['id']}\``)
            .setColor(__1.client.colors.moderation);
        return embed;
    },
};
