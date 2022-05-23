import { Message, TextChannel } from 'discord.js';
import { client } from '../..';
import { Event } from '../../structures/Event';
import { ignores } from '../../json/logs.json';
import { logActivity } from '../../functions/logs/checkActivity';
const ignore = ignores.messageDelete;

export default new Event('messageDelete', async (message: Message) => {
	if (!logActivity('message')) return;

	if (!message.author) return;
	if (!message.content.length && !message.attachments.size) return;

	const channel = message?.channel as TextChannel;
	if (
		!message?.guild ||
		message?.guildId !== client.server.id ||
		message?.author?.bot ||
		ignore.category.includes(channel?.parentId) ||
		ignore.channel.includes(channel?.id) ||
		ignore.roles.some((role) => message?.member?.roles?.cache.has(role))
	)
		return;

	const logEmbed = client.util
		.embed()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.author.displayAvatarURL(),
		})
		.setTitle('Message Deleted')
		.setDescription(message.content || 'No content.')
		.setColor(client.util.resolve.color('#b59190'))
		.setFooter({ text: 'Message ID: ' + message.id })
		.addFields(
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
			}
		);

	client.webhooks.message.send({ embeds: [logEmbed] });
});
