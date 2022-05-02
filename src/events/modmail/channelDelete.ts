import { Guild, TextChannel, ChannelType } from 'discord.js';
import { client } from '../..';
import { Event } from '../../structures/Event';
import { categoryId, modmailCooldown, serverId } from './messageCreate';

export default new Event('channelDelete', async (channel) => {
	const guild =
		client.guilds.cache.get(serverId) || ((await client.guilds.fetch(serverId)) as Guild);
	// Ignoring channel types
	if (channel.type !== ChannelType.GuildText) return;
	channel = channel as TextChannel;

	if (channel.parentId !== categoryId) return;

	// Finding the user
	const channelTopic = channel.topic;
	const usersThread = guild.members.cache.find(
		(user) => user.id === channelTopic?.slice(channelTopic?.length - user.id.length)
	);

	if (!usersThread) return;

	const closedEmbed = client.util
		.embed()
		.setAuthor({ name: guild.name, iconURL: guild.iconURL() })
		.setTitle('Thread Closed')
		.setDescription(
			`Your thread has been closed by a staff member, thanks for contacting ${guild.name}. If you got more questions, feel free to open a thread and ask them!`
		)
		.setColor(client.util.resolve.color('Red'));

	usersThread?.send({ embeds: [closedEmbed] }).catch(() => {});

	modmailCooldown.set(`create-new-on-close_${usersThread?.user.id}`, Date.now() + 600000);
	setTimeout(() => {
		modmailCooldown.delete(`create-new-on-close_${usersThread?.user.id}`);
	}, 600000);
});
