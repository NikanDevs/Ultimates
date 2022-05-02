import { ButtonStyle, GuildMember, TextChannel } from 'discord.js';
import { client } from '../..';
import { Event } from '../../structures/Event';
import { ignores } from '../../json/logs.json';
import { messageLogging } from '../../webhooks';
const ignore = ignores.MessageUpdate;

export default new Event('messageUpdate', async (oldMessage, newMessage) => {
	const channel = newMessage?.channel as TextChannel;
	const member = newMessage.member as GuildMember;

	if (
		!newMessage?.guild ||
		newMessage?.guildId !== client.server.id ||
		newMessage.author?.bot ||
		ignore.category.includes(channel?.parentId) ||
		ignore.channel.includes(channel?.id) ||
		ignore.roles.some((role) => member?.roles?.cache.has(role))
	)
		return;

	// Creating the embed!
	const logEmbed = client.util
		.embed()
		.setAuthor({
			name: newMessage.author?.tag,
			iconURL: newMessage.author?.displayAvatarURL(),
		})
		.setTitle('Message Edited')
		.setColor(client.util.resolve.color('#b59190'));

	// If the old message contains a content
	if (oldMessage.content) {
		logEmbed.addFields({
			name: 'Old Message',
			value: `${client.util.splitText(oldMessage?.content, {
				splitFor: 'Embed Field Value',
			})}`,
		});
	}

	// If the new message contains a content
	if (newMessage.content) {
		logEmbed.addFields({
			name: 'New Message',
			value: `${client.util.splitText(newMessage?.content, {
				splitFor: 'Embed Field Value',
			})}`,
		});
	}

	// If the old message contains attachments
	if (oldMessage.attachments.size !== 0) {
		const attachmentsMapped = oldMessage.attachments?.map((data) => {
			return `• [${data.name}](${data.proxyURL})`;
		});

		logEmbed.addFields({
			name: `Old Attachments [${oldMessage.attachments.size}]`,
			value: attachmentsMapped.join('\n'),
		});
	}

	// If the new message contains attachments
	if (newMessage.attachments.size !== 0) {
		const attachmentsMapped = newMessage.attachments?.map((data) => {
			return `• [${data.name}](${data.proxyURL})`;
		});

		logEmbed.addFields({
			name: `New Attachments [${newMessage.attachments.size}]`,
			value: attachmentsMapped.join('\n'),
		});
	}

	logEmbed.addFields(
		{
			name: 'User',
			value: `${newMessage.author}`,
			inline: true,
		},
		{
			name: 'Channel',
			value: `${newMessage.channel}`,
			inline: true,
		},
		{
			name: 'Edited At',
			value: `<t:${~~(+newMessage.editedTimestamp / 1000)}:R>`,
			inline: true,
		}
	);

	const jumpToMessage = client.util
		.actionRow()
		.addComponents(
			client.util
				.button()
				.setLabel('Take me there!')
				.setStyle(ButtonStyle['Link'])
				.setURL(`${oldMessage.url}`)
		);

	messageLogging.send({
		embeds: [logEmbed],
		components: [jumpToMessage],
	});
});
