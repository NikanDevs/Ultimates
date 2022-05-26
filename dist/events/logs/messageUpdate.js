"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
const Event_1 = require("../../structures/Event");
const logs_json_1 = require("../../json/logs.json");
const checkActivity_1 = require("../../functions/logs/checkActivity");
const config_json_1 = require("../../json/config.json");
const ignore = logs_json_1.ignores.MessageUpdate;
exports.default = new Event_1.Event('messageUpdate', async (oldMessage, newMessage) => {
    if (!(0, checkActivity_1.logActivity)('message'))
        return;
    if (!oldMessage.author)
        return;
    if (!oldMessage.content.length && !oldMessage.attachments.size)
        return;
    if (oldMessage.content === newMessage.content)
        return;
    const channel = newMessage?.channel;
    const member = newMessage.member;
    if (!newMessage?.guild ||
        newMessage?.guildId !== config_json_1.guild.id ||
        newMessage.author?.bot ||
        ignore.category.includes(channel?.parentId) ||
        ignore.channel.includes(channel?.id) ||
        ignore.roles.some((role) => member?.roles?.cache.has(role)))
        return;
    const logEmbed = __1.client.util
        .embed()
        .setAuthor({
        name: newMessage.author?.tag,
        iconURL: newMessage.author?.displayAvatarURL(),
    })
        .setTitle('Message Edited')
        .setURL(newMessage.url)
        .setColor(__1.client.util.resolve.color('#b59190'))
        .setFooter({ text: 'Message ID: ' + newMessage.id });
    if (oldMessage.content !== newMessage.content) {
        logEmbed.addFields({
            name: 'Old message ',
            value: __1.client.util.splitText(oldMessage?.content, {
                splitFor: 'Embed Field Value',
            }),
        }, {
            name: 'New content',
            value: __1.client.util.splitText(newMessage?.content, {
                splitFor: 'Embed Field Value',
            }),
        });
    }
    logEmbed.addFields({
        name: 'User',
        value: `${newMessage.author}`,
        inline: true,
    }, {
        name: 'Channel',
        value: `${newMessage.channel}`,
        inline: true,
    }, {
        name: 'Edited At',
        value: `<t:${~~(+newMessage.editedTimestamp / 1000)}:R>`,
        inline: true,
    });
    __1.client.webhooks.message.send({
        embeds: [logEmbed],
    });
});
