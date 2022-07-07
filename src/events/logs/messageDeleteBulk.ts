import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	TextChannel,
	Util,
} from 'discord.js';
import { client } from '../..';
import { Event } from '../../structures/Event';
import { create } from 'sourcebin';
import { logActivity } from '../../functions/logs/checkActivity';
import { EMBED_DESCRIPTION_MAX_LENGTH } from '../../constants';
import { splitText } from '../../functions/other/splitText';

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
				msg.content ? splitText(msg.content, 50) : 'No Content'
			}`;
		})
		.slice(0, messagesToShow);

	// Creating the embed!
	const logEmbed = new EmbedBuilder()
		.setAuthor({
			name: randomMessage.author?.tag,
			iconURL: randomMessage.author.displayAvatarURL(),
		})
		.setTitle('Messages Bulk Deleted')
		.setColor(Util.resolveColor('#b59190'))
		.addFields([
			{
				name: 'Channel',
				value: `${randomMessage.channel}`,
				inline: true,
			},
			{
				name: 'Showing',
				value: `${messagesToShow}`,
				inline: true,
			},
			{
				name: 'Amount',
				value: messages.size.toString(),
				inline: true,
			},
		]);
	logEmbed.setDescription(
		`${splitText(messagesMapped.join('\n'), EMBED_DESCRIPTION_MAX_LENGTH)}`
	);

	if (messages.size > 10) {
		const webHookMsg = await client.config.webhooks.message.send({
			content: 'Preparing the bulk message delete logs...',
		});

		const map = messages.map((msg) => {
			return [msg.author.tag, '::', msg.content ? msg.content : 'No Content'].join(' ');
		});

		const srcbin = await create(
			[
				{
					content: `${map.join('\n')}`,
					language: 'AsciiDoc',
				},
			],
			{
				title: `Bulk Deleted Messages`,
				description: `Bulk Deleted Messages in #${channel.name} - amount: ${messages.size}`,
			}
		);

		const viewAllRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
			new ButtonBuilder()
				.setLabel('View All Messages')
				.setStyle(ButtonStyle.Link)
				.setURL(srcbin.url),
		]);

		client.config.webhooks.message.editMessage(webHookMsg.id, {
			embeds: [logEmbed],
			components: [viewAllRow],
			content: ' ',
		});
	} else {
		client.config.webhooks.message.send({ embeds: [logEmbed] });
	}
});
