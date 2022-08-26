import { EmbedBuilder, GuildMember, resolveColor } from 'discord.js';
import { client } from '../..';
import { Event } from '../../structures/Event';
import { logActivity } from '../../functions/logs/checkActivity';
import { MAX_FIELD_VALUE_LENGTH } from '../../constants';
import { splitText } from '../../functions/other/splitText';
import { generateDiscordTimestamp } from '../../utils/generateDiscordTimestamp';
import { t } from 'i18next';

export default new Event('messageUpdate', async (oldMessage, newMessage) => {
	if (!logActivity('message')) return;
	const channel = newMessage.channel;
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
			t('event.logs.messageUpdate.description', {
				url: newMessage.url,
				channel: channel.toString(),
				date: generateDiscordTimestamp(new Date()),
			})
		)
		.setURL(newMessage.url)
		.setColor(resolveColor('#b59190'))
		.addFields([
			{
				name: t('event.logs.messageUpdate.content', { context: 'old' }),
				value:
					splitText(oldMessage?.content, MAX_FIELD_VALUE_LENGTH) ??
					t('event.logs.messageUpdate.content', { context: 'none' }),
			},
			{
				name: t('event.logs.messageUpdate.content', { context: 'edited' }),
				value:
					splitText(newMessage?.content, MAX_FIELD_VALUE_LENGTH) ??
					t('event.logs.messageUpdate.content', { context: 'none' }),
			},
		])
		.addFields([
			{
				name: t('event.logs.messageUpdate.ids'),
				value: t('event.logs.messageUpdate.ids', {
					context: 'value',
					member: newMessage.member.id,
					message: newMessage.id,
				}),
			},
		]);

	client.config.webhooks.message.send({
		embeds: [logEmbed],
	});
});
