"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const __1 = require("../..");
const Event_1 = require("../../structures/Event");
const config_json_1 = require("../../json/config.json");
exports.default = new Event_1.Event('typingStart', async (typing) => {
    await typing.channel?.fetch().catch(() => { });
    const guild = __1.client.guilds.cache.get(config_json_1.guild.id) ||
        (await __1.client.guilds.fetch(config_json_1.guild.id));
    if (typing.user.bot)
        return;
    if (typing.guild) {
        if (typing.channel.parentId !== config_json_1.guild.modmailCategoryId)
            return;
        const channelTopic = typing.channel.topic;
        const usersThread = guild.members.cache.find((user) => user.id === channelTopic.slice(channelTopic.length - user.id.length));
        if (!usersThread)
            return;
        const usersDM = usersThread?.user.dmChannel ||
            (await usersThread?.user.dmChannel.fetch());
        await usersDM?.sendTyping();
    }
    else if (!typing.guild && typing.channel.type === discord_js_1.ChannelType.DM) {
        const openedThread = guild.channels.cache
            .filter((channel) => channel.parentId === config_json_1.guild.modmailCategoryId &&
            channel.type === discord_js_1.ChannelType.GuildText)
            .find((channel) => channel?.topic?.endsWith(`${typing.user.id}`));
        if (!openedThread)
            return;
        await openedThread?.sendTyping();
    }
});
