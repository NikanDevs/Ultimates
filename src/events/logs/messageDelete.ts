import { EmbedBuilder, Message, resolveColor, TextChannel } from 'discord.js';
import { client } from '../..';
import { Event } from '../../structures/Event';
import { logActivity } from '../../functions/logs/checkActivity';
import { generateDiscordTimestamp } from '../../utils/generateDiscordTimestamp';
import { splitText } from '../../functions/other/splitText';
import { MAX_FIELD_VALUE_LENGTH } from '../../constants';

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
		.setDescription(`Message deleted in ${channel} • ${generateDiscordTimestamp(new Date())}`)
		.setColor(resolveColor('#b59190'))
		.addFields([
			{
				name: 'Content',
				value:
					splitText(message.content, MAX_FIELD_VALUE_LENGTH) ??
					'The message has no content.',
			},
			{
				name: 'IDs',
				value: `\`\`\`ini\nMember = ${message.author.id}\`\`\``,
			},
		]);

	client.config.webhooks.message.send({ embeds: [logEmbed] });
});
