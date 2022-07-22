import { EmbedBuilder, resolveColor, TextChannel } from 'discord.js';
import { client } from '../..';
import { modmailModel } from '../../models/modmail';
import {
	type createModmailLogOptions,
	ModmailActionTypes,
	modmailTicketData,
	modmailActionTypeEmbedColors,
} from '../../typings';
import { addModmailTicket } from '../cases/modmailCase';
import { generateDiscordTimestamp } from '../../utils/generateDiscordTimestamp';
import { logActivity } from './checkActivity';
import { capitalize } from '../other/capitalize';
import { t } from 'i18next';

/** Creates a new modmail log and post the log to the modmail webhook. */
export async function createModmailLog(options: createModmailLogOptions) {
	const ticket = options.ticket;
	const embed = new EmbedBuilder()
		.setAuthor({
			name: `Modmail | ${
				options.action === ModmailActionTypes.Open
					? ticket.type === 'DIRECT'
						? 'Direct Open'
						: 'Open Request'
					: capitalize(options.action)
			}`,
			iconURL: client.user.displayAvatarURL(),
		})
		.setColor(resolveColor(modmailActionTypeEmbedColors[options.action]))
		.setDescription(
			[
				`${options.ticketId ? `• **Ticket:** #${options.ticketId}` : ''}\n`,
				`• **Action:** ${capitalize(options.action)}`,
				`• **Member:** ${options.user.tag} • ${options.user.id}`,
				options.action === ModmailActionTypes.Open ? `• **Channel:** ${ticket.channel}` : 'LINE_BREAK',
				options.moderator
					? `• **Moderator:** ${
							options.moderator.id !== client.user.id
								? `${options.moderator.tag} • ${options.moderator.id}`
								: 'Automatic'
					  }`
					: 'LINE_BREAK',
				`• **Date:** ${generateDiscordTimestamp(new Date(), 'Short Date/Time')}`,
				`• **Reason:** ${options.reason ?? t('common.noReason')}`,
				`\n${
					!options.referencedCaseUrl
						? ''
						: options.action === ModmailActionTypes.Close
						? `[Take me to the creation](${options.referencedCaseUrl}) • [View transcript](${options.transcript})`
						: options.action === ModmailActionTypes.BlacklistRemove
						? `[Take me to the blacklist](${options.referencedCaseUrl})`
						: ''
				}`,
			]
				.join('\n')
				.replaceAll('LINE_BREAK\n', '')
		);
	if (logActivity('modmail')) var logMessage = await client.config.webhooks.modmail.send({ embeds: [embed] });

	if (options.action === ModmailActionTypes.Open) {
		await addModmailTicket();

		if (logActivity('modmail'))
			var findMessage = await (client.channels.cache.get(logMessage.channel_id) as TextChannel).messages.fetch(
				logMessage.id
			);

		await modmailModel.findByIdAndUpdate('substance', {
			$push: {
				openedTickets: {
					id: options.ticketId,
					userId: options.user.id,
					type: ticket.type.toUpperCase(),
					url: findMessage?.url,
					createdAt: ticket.channel.createdAt,
				},
			},
		});
	} else if (options.action === ModmailActionTypes.BlacklistAdd && logActivity('modmail')) {
		let findMessage = await (client.channels.cache.get(logMessage.channel_id) as TextChannel).messages.fetch(
			logMessage.id
		);

		await modmailModel.findByIdAndUpdate(options.user.id, { $set: { url: findMessage.url } });
	} else if (options.action === ModmailActionTypes.Close) {
		const openedTickets = (await modmailModel.findById('substance')).openedTickets;
		const ticketData = (openedTickets as modmailTicketData[]).find((data) => data.userId === options.user.id);

		await modmailModel.findByIdAndUpdate('substance', {
			$pull: { openedTickets: { userId: ticketData.userId } },
		});
	}
}
