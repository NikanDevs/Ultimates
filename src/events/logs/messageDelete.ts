import { EmbedBuilder, Message, resolveColor, TextChannel } from 'discord.js';
import { client } from '../..';
import { Event } from '../../structures/Event';
import { logActivity } from '../../functions/logs/checkActivity';

export default new Event('messageDelete', async (message: Message) => {
	if (!logActivity('message')) return;

	if (!message.author) return;
	if (!message.content.length && !message.attachments.size) return;

	const channel = message?.channel as TextChannel;
	if (
		!message?.guild ||
		message?.guildId !== process.env.GUILD_ID ||
		message?.author?.bot ||
		client.config.ignores.logs.message.channelIds.includes(channel?.id) ||
		client.config.ignores.logs.message.roleIds.some((role) =>
			message?.member?.roles?.cache.has(role)
		)
	)
		return;

	const logEmbed = new EmbedBuilder()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.author.displayAvatarURL(),
		})
		.setTitle('Message Deleted')
		.setDescription(message.content || 'No content.')
		.setColor(resolveColor('#b59190'))
		.setFooter({ text: 'Message ID: ' + message.id })
		.addFields([
			{
				name: 'Mention',
				value: `${message.author}`,
				inline: true,
			},
			{
				name: 'Channel',
				value: `${message.channel}`,
				inline: true,
			},
			{
				name: 'Attachments',
				value: message.attachments.size
					? `${message.attachments.size} attachments`
					: 'No attachments',
				inline: true,
			},
		]);

	client.config.webhooks.message.send({ embeds: [logEmbed] });
});
