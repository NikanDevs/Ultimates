import { ChannelType, DMChannel, Guild, GuildBasedChannel, TextChannel } from 'discord.js';
import { client } from '../..';
import { Event } from '../../structures/Event';
import { categoryId, serverId } from './messageCreate';

export default new Event('typingStart', async (typing) => {
	// Fetching the channel
	await typing.channel?.fetch().catch(() => {});

	const guild =
		client.guilds.cache.get(serverId) || ((await client.guilds.fetch(serverId)) as Guild);
	if (typing.user.bot) return;

	if (typing.guild) {
		// Ignoring other categories
		if ((typing.channel as GuildBasedChannel).parentId !== categoryId) return;

		// Finding the user
		const channelTopic = (typing.channel as TextChannel).topic;
		const usersThread = guild.members.cache.find(
			(user) => user.id === channelTopic.slice(channelTopic.length - user.id.length)
		);

		if (!usersThread) return;

		const usersDM =
			usersThread?.user.dmChannel ||
			((await usersThread?.user.dmChannel.fetch()) as DMChannel);
		await usersDM?.sendTyping();
	} else if (!typing.guild && typing.channel.type === ChannelType.DM) {
		// Finding the channel
		const openedThread = guild.channels.cache
			.filter(
				(channel) =>
					channel.parentId === categoryId && channel.type === ChannelType.GuildText
			)
			.find((channel: TextChannel) =>
				channel?.topic?.endsWith(`${typing.user.id}`)
			) as TextChannel;

		if (!openedThread) return;

		await openedThread?.sendTyping();
	}
});