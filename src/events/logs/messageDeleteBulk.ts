import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, resolveColor, TextChannel } from 'discord.js';
import { client } from '../..';
import { Event } from '../../structures/Event';
import { create } from 'sourcebin';
import { logActivity } from '../../functions/logs/checkActivity';
import { EMBED_DESCRIPTION_MAX_LENGTH } from '../../constants';
import { splitText } from '../../functions/other/splitText';
import { t } from 'i18next';

export default new Event('messageDeleteBulk', async (messages) => {
	if (!logActivity('message')) return;

	const randomMessage = messages.random();
	const channel = randomMessage?.channel as TextChannel;
	if (
		!randomMessage?.guild ||
		randomMessage?.guildId !== process.env.GUILD_ID ||
		client.config.ignores.logs.message.channelIds.includes(channel?.id)
	)
		return;

	let messagesToShow: number = messages.size;
	if (messages.size >= 10) messagesToShow = 10;

	const messagesMapped = messages
		.sort((a, b) => a.createdTimestamp - b.createdTimestamp)
		.map((msg) => {
			return `**${msg.author?.tag}**: ${
				msg.content ? splitText(msg.content, 50) : t('event.logs.messageDeleteBulk.noContent')
			}`;
		})
		.slice(0, messagesToShow);

	const logEmbed = new EmbedBuilder()
		.setAuthor({
			name: randomMessage.author?.tag,
			iconURL: randomMessage.author.displayAvatarURL(),
		})
		.setTitle(t('event.logs.messageDeleteBulk.bulkDeleted'))
		.setColor(resolveColor('#b59190'))
		.addFields([
			{
				name: t('event.logs.messageDeleteBulk.channel'),
				value: `${randomMessage.channel}`,
				inline: true,
			},
			{
				name: t('event.logs.messageDeleteBulk.showing'),
				value: `${messagesToShow}`,
				inline: true,
			},
			{
				name: t('event.logs.messageDeleteBulk.amount'),
				value: messages.size.toString(),
				inline: true,
			},
		]);
	logEmbed.setDescription(`${splitText(messagesMapped.join('\n'), EMBED_DESCRIPTION_MAX_LENGTH)}`);

	if (messages.size > 10) {
		const webHookMsg = await client.config.logging.webhook.send({
			threadId: client.config.logging.message.channelId,
			content: t('event.logs.messageDeleteBulk.preparing'),
		});

		const map = messages.map((msg) => {
			return [
				`${msg.author.tag} (${msg.author.id})`,
				'::',
				msg.content ? msg.content : t('event.logs.messageDeleteBulk.noContent'),
			].join(' ');
		});

		const srcbin = await create(
			[
				{
					content: `${map.join('\n')}`,
					language: 'AsciiDoc',
				},
			],
			{
				title: t('event.logs.messageDeleteBulk.bulkDeleted'),
			}
		);

		const viewAllRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
			new ButtonBuilder()
				.setLabel(t(t('event.logs.messageDeleteBulk.viewAll')))
				.setStyle(ButtonStyle.Link)
				.setURL(srcbin.url),
		]);

		client.config.logging.webhook.editMessage(webHookMsg.id, {
			threadId: client.config.logging.message.channelId,
			embeds: [logEmbed],
			components: [viewAllRow],
			content: null,
		});
	} else {
		client.config.logging.webhook.send({ threadId: client.config.logging.message.channelId, embeds: [logEmbed] });
	}
});
