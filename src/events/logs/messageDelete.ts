import { Message, TextChannel } from 'discord.js';
import { client } from '../..';
import { Event } from '../../structures/Event';
import { ignores } from '../../json/logs.json';
import { messageLogging } from '../../webhooks';
const ignore = ignores.messageDelete;

export default new Event('messageDelete', async (message: Message) => {
	// Filtering the data
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

	// Creating the embed!
	const logEmbed = client.util
		.embed()
		.setAuthor({
			name: message.author?.tag,
			iconURL: message.author?.displayAvatarURL(),
		})
		.setTitle('Message Deleted')
		.setColor(client.util.resolve.color('#b59190'))
		.addFields(
			{
				name: 'User',
				value: `${message.author}`,
				inline: true,
			},
			{
				name: 'Channel',
				value: `${message.channel}`,
				inline: true,
			},
			{
				name: 'Sent At',
				value: `<t:${~~(+message.createdAt / 1000)}:R>`,
				inline: true,
			}
		);

	// If the message contains a content
	if (message.content) {
		logEmbed.setDescription(message.content);
	}

	// If the message contains attachments
	if (message.attachments.size !== 0) {
		const attachmentsMapped = message.attachments?.map((data) => {
			return `• [${data.name}](${data.proxyURL})`;
		});

		logEmbed.addFields({
			name: `Attachments [${message.attachments.size}]`,
			value: attachmentsMapped.join('\n'),
		});
	}

	messageLogging.send({ embeds: [logEmbed] });
});
