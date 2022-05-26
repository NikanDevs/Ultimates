"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendModDM = void 0;
const discord_js_1 = require("discord.js");
const __1 = require("..");
const PunishmentType_1 = require("../typings/PunishmentType");
const generateDiscordTimestamp_1 = require("./generateDiscordTimestamp");
const moderation_json_1 = require("../json/moderation.json");
const config_json_1 = require("../json/config.json");
async function sendModDM(member, options) {
    let pastForm;
    (function (pastForm) {
        pastForm["WARN"] = "warned";
        pastForm["BAN"] = "banned";
        pastForm["KICK"] = "kicked";
        pastForm["TIMEOUT"] = "timed out";
        pastForm["UNBAN"] = "unbanned";
        pastForm["SOFTBAN"] = "soft banned";
    })(pastForm || (pastForm = {}));
    let suffix;
    (function (suffix) {
        suffix["WARN"] = "in";
        suffix["BAN"] = "from";
        suffix["KICK"] = "from";
        suffix["TIMEOUT"] = "in";
        suffix["UNBAN"] = "from";
        suffix["SOFTBAN"] = "from";
    })(suffix || (suffix = {}));
    const automod = options.automod ? true : false;
    const embed = __1.client.util
        .embed()
        .setAuthor({
        name: __1.client.user.username,
        iconURL: __1.client.user.displayAvatarURL(),
    })
        .setTitle(`You were ${pastForm[options.action]} ${suffix[options.action]} ` + member.guild.name)
        .setColor(__1.client.cc.invisible)
        .addFields(automod
        ? {
            name: 'Type',
            value: 'Automod',
            inline: true,
        }
        : {
            name: 'Punishment ID',
            value: options.punishment._id,
            inline: true,
        }, {
        name: options.action === PunishmentType_1.PunishmentType.Timeout ? 'Ends' : 'Expires',
        value: `${options.expire
            ? (0, generateDiscordTimestamp_1.generateDiscordTimestamp)(options.expire)
            : options.action === PunishmentType_1.PunishmentType.Kick
                ? 'You can join back'
                : 'Permanent'}`,
        inline: true,
    }, {
        name: 'Reason',
        value: options.punishment.reason || moderation_json_1.default_config.reason,
        inline: false,
    });
    const appealButton = __1.client.util
        .actionRow()
        .addComponents(__1.client.util
        .button()
        .setURL(config_json_1.guild.appealLink)
        .setStyle(discord_js_1.ButtonStyle['Link'])
        .setLabel('Appeal'));
    let appealComponent = [];
    if ((options.action === PunishmentType_1.PunishmentType.Ban || options.action === PunishmentType_1.PunishmentType.Softban) &&
        config_json_1.guild.appealLink?.length !== undefined)
        appealComponent = [appealButton];
    await member.send({ embeds: [embed], components: appealComponent }).catch(() => { });
}
exports.sendModDM = sendModDM;
