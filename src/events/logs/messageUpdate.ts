import { EmbedBuilder, GuildMember, TextChannel } from 'discord.js';
import { client } from '../..';
import { Event } from '../../structures/Event';
import { ignores } from '../../json/logs.json';
import { logActivity } from '../../functions/logs/checkActivity';
import { guildId } from '../../json/config.json';
import { MAX_FIELD_VALUE_LENGTH } from '../../constants';
const ignore = ignores.MessageUpdate;

export default new Event('messageUpdate', async (oldMessage, newMessage) => {
	if (!logActivity('message')) return;

	if (!oldMessage.author) return;
	if (!oldMessage.content.length && !oldMessage.attachments.size) return;
	if (oldMessage.content === newMessage.content) return;

	const channel = newMessage?.channel as TextChannel;
	const member = newMessage.member as GuildMember;

	if (
		!newMessage?.guild ||
		newMessage?.guildId !== guildId ||
		newMessage.author?.bot ||
		ignore.category.includes(channel?.parentId) ||
		ignore.channel.includes(channel?.id) ||
		ignore.roles.some((role) => member?.roles?.cache.has(role))
	)
		return;

	const logEmbed = new EmbedBuilder()
		.setAuthor({
			name: newMessage.author?.tag,
			iconURL: newMessage.author?.displayAvatarURL(),
		})
		.setTitle('Message Edited')
		.setURL(newMessage.url)
		.setColor(client.util.resolve.color('#b59190'))
		.setFooter({ text: 'Message ID: ' + newMessage.id });

	if (oldMessage.content !== newMessage.content) {
		logEmbed.addFields([
			{
				name: 'Old message ',
				value: client.util.splitText(oldMessage?.content, MAX_FIELD_VALUE_LENGTH),
			},
			{
				name: 'New content',
				value: client.util.splitText(newMessage?.content, MAX_FIELD_VALUE_LENGTH),
			},
		]);
	}

	logEmbed.addFields([
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
		},
	]);

	client.config.webhooks.message.send({
		embeds: [logEmbed],
	});
});
