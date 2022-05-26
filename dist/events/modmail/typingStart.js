"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const __1 = require("../..");
const Event_1 = require("../../structures/Event");
const messageCreate_1 = require("./messageCreate");
exports.default = new Event_1.Event('typingStart', async (typing) => {
    await typing.channel?.fetch().catch(() => { });
    const guild = __1.client.guilds.cache.get(messageCreate_1.serverId) || (await __1.client.guilds.fetch(messageCreate_1.serverId));
    if (typing.user.bot)
        return;
    if (typing.guild) {
        if (typing.channel.parentId !== messageCreate_1.categoryId)
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
            .filter((channel) => channel.parentId === messageCreate_1.categoryId && channel.type === discord_js_1.ChannelType.GuildText)
            .find((channel) => channel?.topic?.endsWith(`${typing.user.id}`));
        if (!openedThread)
            return;
        await openedThread?.sendTyping();
    }
});
