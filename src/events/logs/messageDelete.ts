import { EmbedBuilder, Message, resolveColor } from 'discord.js';
import { client } from '../..';
import { Event } from '../../structures/Event';
import { logActivity } from '../../functions/logs/checkActivity';
import { generateDiscordTimestamp } from '../../utils/generateDiscordTimestamp';
import { splitText } from '../../functions/other/splitText';
import { MAX_FIELD_VALUE_LENGTH } from '../../constants';
import { t } from 'i18next';

export default new Event('messageDelete', async (message: Message) => {
	if (!logActivity('message')) return;

	if (!message.author) return;
	if (!message.content.length && !message.attachments.size) return;

	const channel = message.channel;
	if (
		!message?.guild ||
		message?.guildId !== process.env.GUILD_ID ||
		message?.author?.bot ||
		client.config.ignores.logs.message.channelIds.includes(channel?.id) ||
		client.config.ignores.logs.message.roleIds.some((role) => message?.member?.roles?.cache.has(role))
	)
		return;

	const logEmbed = new EmbedBuilder()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.author.displayAvatarURL(),
		})
		.setDescription(
			t('event.logs.messageDelete.description', {
				channel: channel.toString(),
				date: generateDiscordTimestamp(new Date()),
			})
		)
		.setColor(resolveColor('#b59190'))
		.addFields([
			{
				name: t('event.logs.messageDelete.content'),
				value:
					splitText(message.content, MAX_FIELD_VALUE_LENGTH) ??
					t('event.logs.messageDelete.content', { context: 'none' }),
			},
			{
				name: t('event.logs.messageDelete.ids'),
				value: t('event.logs.messageDelete.ids', { context: 'value', member: message.member.id }),
			},
		]);

	client.config.webhooks.message.send({ embeds: [logEmbed] });
});
