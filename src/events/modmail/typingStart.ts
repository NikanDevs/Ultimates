import { ChannelType, DMChannel, TextChannel } from 'discord.js';
import { client } from '../..';
import { Event } from '../../structures/Event';

export default new Event('typingStart', async (typing) => {
	const guild = client.guilds.cache.get(process.env.GUILD_ID);

	await typing.channel?.fetch().catch(() => {});
	if (typing.user.bot) return;

	if (typing.inGuild()) {
		if (typing.channel.type !== ChannelType.GuildText) return;
		if (typing.channel.parentId !== client.config.general.modmailCategoryId || !typing.channel.parentId) return;

		const channelTopic = typing.channel.topic;
		const usersThread = guild.members.cache.find(
			(user) =>
				user.id === channelTopic.split('|')[channelTopic.split('|').length - 1].replace('ID:', '').trim()
		);

		if (!usersThread) return;

		const usersDM = usersThread?.user.dmChannel || ((await usersThread?.user.dmChannel.fetch()) as DMChannel);
		await usersDM?.sendTyping();
	} else if (!typing.guild && typing.channel.type === ChannelType.DM) {
		const openedThread = guild.channels.cache
			.filter(
				(channel) =>
					channel.parentId === client.config.general.modmailCategoryId &&
					channel.type === ChannelType.GuildText
			)
			.find((channel: TextChannel) => channel?.topic?.endsWith(typing.user.id)) as TextChannel;

		if (!openedThread) return;
		await openedThread?.sendTyping();
	}
});
