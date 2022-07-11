import { EmbedBuilder, GuildMember, resolveColor, TextChannel } from 'discord.js';
import { client } from '../..';
import { Event } from '../../structures/Event';
import { logActivity } from '../../functions/logs/checkActivity';
import { MAX_FIELD_VALUE_LENGTH } from '../../constants';
import { splitText } from '../../functions/other/splitText';
import { generateDiscordTimestamp } from '../../utils/generateDiscordTimestamp';

export default new Event('messageUpdate', async (oldMessage, newMessage) => {
	if (!logActivity('message')) return;

	if (!oldMessage.author) return;
	if (!oldMessage.content.length && !oldMessage.attachments.size) return;
	if (oldMessage.content === newMessage.content) return;

	const channel = newMessage?.channel as TextChannel;
	const member = newMessage.member as GuildMember;

	if (
		!newMessage?.guild ||
		newMessage?.guildId !== process.env.GUILD_ID ||
		newMessage.author?.bot ||
		client.config.ignores.logs.message.channelIds.includes(channel?.id) ||
		client.config.ignores.logs.message.roleIds.some((role) => member?.roles?.cache.has(role))
	)
		return;

	const logEmbed = new EmbedBuilder()
		.setAuthor({
			name: newMessage.author?.tag,
			iconURL: newMessage.author?.displayAvatarURL(),
		})
		.setTitle(`Message Edited in #${channel.name}`)
		.setURL(newMessage.url)
		.setColor(resolveColor('#b59190'));

	if (oldMessage.content !== newMessage.content) {
		logEmbed.addFields([
			{
				name: 'Old message ',
				value: splitText(oldMessage?.content, MAX_FIELD_VALUE_LENGTH),
			},
			{
				name: 'New content',
				value: splitText(newMessage?.content, MAX_FIELD_VALUE_LENGTH),
			},
		]);
	}

	logEmbed.addFields([
		{
			name: 'IDs',
			value: `\`\`\`ini\nChannel = ${channel.id}\nMember = ${
				newMessage.author.id
			}\nMessage = ${newMessage.id}\`\`\`${generateDiscordTimestamp(new Date())}`,
		},
	]);

	client.config.webhooks.message.send({
		embeds: [logEmbed],
	});
});
