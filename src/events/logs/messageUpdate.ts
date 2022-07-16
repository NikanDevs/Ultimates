import { EmbedBuilder, Formatters, GuildMember, resolveColor, TextChannel } from 'discord.js';
import { client } from '../..';
import { Event } from '../../structures/Event';
import { logActivity } from '../../functions/logs/checkActivity';
import { MAX_FIELD_VALUE_LENGTH } from '../../constants';
import { splitText } from '../../functions/other/splitText';
import { generateDiscordTimestamp } from '../../utils/generateDiscordTimestamp';

export default new Event('messageUpdate', async (oldMessage, newMessage) => {
	if (!logActivity('message')) return;
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

	if (!oldMessage.author) return;
	if (!oldMessage.content.length && !oldMessage.attachments.size) return;
	if (oldMessage.content === newMessage.content) return;

	const logEmbed = new EmbedBuilder()
		.setAuthor({
			name: newMessage.author?.tag,
			iconURL: newMessage.author?.displayAvatarURL(),
		})
		.setDescription(
			`${Formatters.hyperlink(
				'Message',
				newMessage.url
			)} edited in ${channel} • ${generateDiscordTimestamp(new Date())}`
		)
		.setURL(newMessage.url)
		.setColor(resolveColor('#b59190'))
		.addFields([
			{
				name: 'Old message ',
				value:
					splitText(oldMessage?.content, MAX_FIELD_VALUE_LENGTH) ??
					"The old message doesn't have a content.",
			},
			{
				name: 'Edited content',
				value:
					splitText(newMessage?.content, MAX_FIELD_VALUE_LENGTH) ??
					"The edited message doesn't have a content.",
			},
		])
		.addFields([
			{
				name: 'IDs',
				value: `\`\`\`ini\nMember = ${newMessage.author.id}\nMessage = ${newMessage.id}\`\`\``,
			},
		]);

	client.config.webhooks.message.send({
		embeds: [logEmbed],
	});
});
