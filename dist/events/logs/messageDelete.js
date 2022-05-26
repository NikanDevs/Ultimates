"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
const Event_1 = require("../../structures/Event");
const logs_json_1 = require("../../json/logs.json");
const checkActivity_1 = require("../../functions/logs/checkActivity");
const ignore = logs_json_1.ignores.messageDelete;
exports.default = new Event_1.Event('messageDelete', async (message) => {
    if (!(0, checkActivity_1.logActivity)('message'))
        return;
    if (!message.author)
        return;
    if (!message.content.length && !message.attachments.size)
        return;
    const channel = message?.channel;
    if (!message?.guild ||
        message?.guildId !== __1.client.server.id ||
        message?.author?.bot ||
        ignore.category.includes(channel?.parentId) ||
        ignore.channel.includes(channel?.id) ||
        ignore.roles.some((role) => message?.member?.roles?.cache.has(role)))
        return;
    const logEmbed = __1.client.util
        .embed()
        .setAuthor({
        name: message.author.tag,
        iconURL: message.author.displayAvatarURL(),
    })
        .setTitle('Message Deleted')
        .setDescription(message.content || 'No content.')
        .setColor(__1.client.util.resolve.color('#b59190'))
        .setFooter({ text: 'Message ID: ' + message.id })
        .addFields({
        name: 'Mention',
        value: `${message.author}`,
        inline: true,
    }, {
        name: 'Channel',
        value: `${message.channel}`,
        inline: true,
    }, {
        name: 'Attachments',
        value: message.attachments.size
            ? `${message.attachments.size} attachments`
            : 'No attachments',
        inline: true,
    });
    __1.client.webhooks.message.send({ embeds: [logEmbed] });
});
