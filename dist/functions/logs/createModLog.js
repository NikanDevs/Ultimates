"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createModLog = exports.getUrlFromCase = void 0;
const discord_js_1 = require("discord.js");
const __1 = require("../..");
const logs_1 = require("../../models/logs");
const PunishmentType_1 = require("../../typings/PunishmentType");
const modCase_1 = require("../cases/modCase");
const generateDiscordTimestamp_1 = require("../../utils/generateDiscordTimestamp");
const moderation_json_1 = require("../../json/moderation.json");
const checkActivity_1 = require("./checkActivity");
const config_json_1 = require("../../json/config.json");
const convertTime_1 = require("../convertTime");
async function getUrlFromCase(tofindCase) {
    const data = await logs_1.logsModel.findById(`${tofindCase}`);
    return data ? data.url : 'https://discord.com/404';
}
exports.getUrlFromCase = getUrlFromCase;
async function createModLog(options) {
    let colors;
    (function (colors) {
        colors["WARN"] = "#d4c03f";
        colors["TIMEOUT"] = "#f5a742";
        colors["BAN"] = "#cc423d";
        colors["KICK"] = "#db644f";
        colors["UNMUTE"] = "#2F3136";
        colors["UNBAN"] = "#68b7bd";
        colors["SOFTBAN"] = "#f07046";
    })(colors || (colors = {}));
    const revoke = options.revoke ? options.revoke : false;
    const update = options.update ? true : false;
    const currentCase = await (0, modCase_1.getModCase)();
    if ((0, checkActivity_1.logActivity)('mod'))
        await (0, modCase_1.addModCase)();
    const embed = new discord_js_1.EmbedBuilder()
        .setAuthor({
        name: ` ${revoke ? 'Revoke' : update ? 'Update' : __1.client.util.capitalize(options.action)} | Case: #${revoke ? options.referencedPunishment.case : currentCase}`,
        iconURL: __1.client.user.displayAvatarURL(),
    })
        .setColor(revoke
        ? discord_js_1.Util.resolveColor('#b04d46')
        : update
            ? __1.client.cc.invisible
            : discord_js_1.Util.resolveColor(colors[options.action]))
        .setDescription([
        `${!options.referencedPunishment
            ? `• **ID:** ${options.punishmentId}`
            : `• **Referenced to:** [Case #${options.referencedPunishment.case}](${await getUrlFromCase(options.referencedPunishment.case)})`}\n`,
        `• **Action:** ${__1.client.util.capitalize(options.action)}`,
        `${options.duration
            ? `• **Duration${options.update === 'duration' ? ' [U]' : ''}:** ${(0, convertTime_1.convertTime)(options.duration)}`
            : 'LINE_BREAK'}`,
        `• **Member:** ${options.user.tag} • ${options.user.id}`,
        `• **Moderator:** ${options.moderator.id !== __1.client.user.id
            ? `${options.moderator.tag} • ${options.moderator.id}`
            : 'Automatic'}`,
        `• **Date:** ${(0, generateDiscordTimestamp_1.generateDiscordTimestamp)(new Date(), 'Short Date/Time')}`,
        `• **Reason${options.update === 'reason' ? ' [U]' : ''}:** ${options.reason || moderation_json_1.default_config.reason}`,
    ]
        .join('\n')
        .replaceAll('\nLINE_BREAK', ''));
    if (!(0, checkActivity_1.logActivity)('mod'))
        return;
    var logMessage = await __1.client.config.webhooks.mod.send({ embeds: [embed] });
    if (update)
        return `https://discord.com/channels/${config_json_1.guild.id}/${logMessage.channel_id}/${logMessage.id}`;
    if (options.action === PunishmentType_1.PunishmentType.Unmute ||
        options.action === PunishmentType_1.PunishmentType.Unban ||
        revoke ||
        update)
        return;
    var findMessage = await __1.client.channels.cache.get(logMessage.channel_id).messages.fetch(logMessage.id);
    const newLogData = new logs_1.logsModel({
        _id: currentCase,
        url: findMessage.url,
        expire: options.expire ? options.expire : null,
    });
    await newLogData.save();
}
exports.createModLog = createModLog;
