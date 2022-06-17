"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createModmailLog = void 0;
const discord_js_1 = require("discord.js");
const __1 = require("../..");
const modmail_1 = require("../../models/modmail");
const Modmail_1 = require("../../typings/Modmail");
const ModmailCase_1 = require("../cases/ModmailCase");
const generateDiscordTimestamp_1 = require("../../utils/generateDiscordTimestamp");
const checkActivity_1 = require("./checkActivity");
/** Creates a new modmail log and post the log to the modmail webhook. */
async function createModmailLog(options) {
    let colors;
    (function (colors) {
        colors["OPEN"] = "#95b874";
        colors["CLOSE"] = "#b89b74";
        colors["BLACKLIST_ADD"] = "#b04646";
        colors["BLACKLIST_REMOVE"] = "#60b3b1";
    })(colors || (colors = {}));
    const ticket = options.ticket;
    const embed = new discord_js_1.EmbedBuilder()
        .setAuthor({
        name: `Modmail | ${options.action === Modmail_1.ModmailActionType.Open
            ? ticket.type === 'DIRECT'
                ? 'Direct Open'
                : 'Open Request'
            : __1.client.util.capitalize(options.action)}`,
        iconURL: __1.client.user.displayAvatarURL(),
    })
        .setColor(discord_js_1.Util.resolveColor(colors[options.action]))
        .setDescription([
        `${options.ticketId ? `• **Ticket:** #${options.ticketId}` : ''}\n`,
        `• **Action:** ${__1.client.util.capitalize(options.action)}`,
        `• **Member:** ${options.user.tag} • ${options.user.id}`,
        options.action === Modmail_1.ModmailActionType.Open
            ? `• **Channel:** ${ticket.channel}`
            : 'LINE_BREAK',
        options.moderator
            ? `• **Moderator:** ${options.moderator.id !== __1.client.user.id
                ? `${options.moderator.tag} • ${options.moderator.id}`
                : 'Automatic'}`
            : 'LINE_BREAK',
        `• **Date:** ${(0, generateDiscordTimestamp_1.generateDiscordTimestamp)(new Date(), 'Short Date/Time')}`,
        `• **Reason:** ${options.reason || __1.client.config.moderation.default.reason}`,
        `\n${!options.referencedCaseUrl
            ? ''
            : options.action === Modmail_1.ModmailActionType.Close
                ? `[Take me to the creation](${options.referencedCaseUrl}) • [View transcript](${options.transcript})`
                : options.action === Modmail_1.ModmailActionType.BlacklistRemove
                    ? `[Take me to the blacklist](${options.referencedCaseUrl})`
                    : ''}`,
    ]
        .join('\n')
        .replaceAll('LINE_BREAK\n', ''));
    if ((0, checkActivity_1.logActivity)('modmail'))
        var logMessage = await __1.client.config.webhooks.modmail.send({ embeds: [embed] });
    if (options.action === Modmail_1.ModmailActionType.Open) {
        await (0, ModmailCase_1.addModmailTicket)();
        if ((0, checkActivity_1.logActivity)('modmail'))
            var findMessage = await __1.client.channels.cache.get(logMessage.channel_id).messages.fetch(logMessage.id);
        await modmail_1.modmailModel.findByIdAndUpdate('substance', {
            $push: {
                openedTickets: {
                    id: options.ticketId,
                    userId: options.user.id,
                    type: ticket.type.toUpperCase(),
                    url: findMessage?.url,
                    createdAt: ticket.channel.createdAt,
                },
            },
        });
    }
    else if (options.action === Modmail_1.ModmailActionType.BlacklistAdd && (0, checkActivity_1.logActivity)('modmail')) {
        let findMessage = await __1.client.channels.cache.get(logMessage.channel_id).messages.fetch(logMessage.id);
        await modmail_1.modmailModel.findByIdAndUpdate(options.user.id, { $set: { url: findMessage.url } });
    }
    else if (options.action === Modmail_1.ModmailActionType.Close) {
        const openedTickets = (await modmail_1.modmailModel.findById('substance')).openedTickets;
        const ticketData = openedTickets.find((data) => data.userId === options.user.id);
        await modmail_1.modmailModel.findByIdAndUpdate('substance', {
            $pull: { openedTickets: { userId: ticketData.userId } },
        });
    }
}
exports.createModmailLog = createModmailLog;
