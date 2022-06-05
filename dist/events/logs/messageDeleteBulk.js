"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const __1 = require("../..");
const Event_1 = require("../../structures/Event");
const logs_json_1 = require("../../json/logs.json");
const sourcebin_1 = require("sourcebin");
const checkActivity_1 = require("../../functions/logs/checkActivity");
const config_json_1 = require("../../json/config.json");
const ignore = logs_json_1.ignores.MessageDeleteBulk;
exports.default = new Event_1.Event('messageDeleteBulk', async (messages) => {
    if (!(0, checkActivity_1.logActivity)('message'))
        return;
    const randomMessage = messages.random();
    const channel = randomMessage?.channel;
    if (!randomMessage?.guild ||
        randomMessage?.guildId !== config_json_1.guild.id ||
        ignore.category.includes(channel?.parentId) ||
        ignore.channel.includes(channel?.id) ||
        ignore.roles.some((role) => randomMessage?.member?.roles?.cache.has(role)))
        return;
    let messagesToShow = messages.size;
    if (messages.size >= 10)
        messagesToShow = 10;
    const messagesMapped = messages
        .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
        .map((msg) => {
        return `**${msg.author?.tag}**: ${msg.content
            ? __1.client.util.splitText(msg.content, { splitCustom: 100 })
            : 'No Content'}`;
    })
        .slice(0, messagesToShow);
    // Creating the embed!
    const logEmbed = new discord_js_1.EmbedBuilder()
        .setAuthor({
        name: randomMessage.author?.tag,
        iconURL: randomMessage.author.displayAvatarURL(),
    })
        .setTitle('Messages Bulk Deleted')
        .setColor(__1.client.util.resolve.color('#b59190'))
        .addFields([
        {
            name: 'Channel',
            value: `${randomMessage.channel}`,
            inline: true,
        },
        {
            name: 'Showing',
            value: `${messagesToShow}`,
            inline: true,
        },
        {
            name: 'Amount',
            value: messages.size.toString(),
            inline: true,
        },
    ]);
    logEmbed.setDescription(`${__1.client.util.splitText(messagesMapped.join('\n'), { splitFor: 'Embed Description' })}`);
    if (messages.size > 10) {
        const webHookMsg = await __1.client.config.webhooks.message.send({
            content: 'Preparing the bulk message delete logs...',
        });
        const map = messages.map((msg) => {
            return [msg.author.tag, '::', msg.content ? msg.content : 'No Content'].join(' ');
        });
        const srcbin = await (0, sourcebin_1.create)([
            {
                content: `${map.join('\n')}`,
                language: 'AsciiDoc',
            },
        ], {
            title: `Bulk Deleted Messages`,
            description: `Bulk Deleted Messages in #${channel.name} - amount: ${messages.size}`,
        });
        const viewAllRow = new discord_js_1.ActionRowBuilder().addComponents([
            new discord_js_1.ButtonBuilder()
                .setLabel('View All Messages')
                .setStyle(discord_js_1.ButtonStyle['Link'])
                .setURL(srcbin.url),
        ]);
        __1.client.config.webhooks.message.editMessage(webHookMsg.id, {
            embeds: [logEmbed],
            components: [viewAllRow],
            content: ' ',
        });
    }
    else {
        __1.client.config.webhooks.message.send({ embeds: [logEmbed] });
    }
});
