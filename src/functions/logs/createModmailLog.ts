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

export async function createModmailLog(options: createModmailLogOptions) {
	const ticket = options.ticket;
	const embed = new EmbedBuilder()
		.setAuthor({
			name: t('log.modmail.title', {
				action:
					options.action === ModmailActionTypes.Open
						? ticket.type === 'DIRECT'
							? t('log.modmail.open', { context: 'direct' })
							: t('log.modmail.open', { context: 'request' })
						: capitalize(options.action),
			}),
			iconURL: client.user.displayAvatarURL(),
		})
		.setColor(resolveColor(modmailActionTypeEmbedColors[options.action]))
		.setDescription(
			[
				`${options.ticketId ? t('log.modmail.ticket', { ticket: options.ticketId }) : ''}\n`,
				t('log.modmail.action', { action: capitalize(options.action) }),

				t('log.modmail.member', { tag: options.user.tag, id: options.user.id }),
				options.action === ModmailActionTypes.Open
					? t('log.modmail.channel', { channel: ticket.channel.toString() })
					: 'LINE_BREAK',
				options.moderator
					? t('log.modmail.moderator', {
							moderator:
								options.moderator.id !== client.user.id
									? `${options.moderator.tag} • ${options.moderator.id}`
									: t('log.automatic'),
					  })
					: 'LINE_BREAK',
				t('log.modmail.date', { date: generateDiscordTimestamp(new Date(), 'Short Date/Time') }),
				t('log.modmail.reason', { reason: options.reason ?? t('common.noReason') }),
				`\n${
					!options.referencedCaseUrl
						? ''
						: options.action === ModmailActionTypes.Close
						? t('log.modmail.on', {
								context: 'close',
								creation: options.referencedCaseUrl,
								transcript: options.transcript,
						  })
						: options.action === ModmailActionTypes.BlacklistRemove
						? t('log.modmail.on', { context: 'blacklist', url: options.referencedCaseUrl })
						: ''
				}`,
			]
				.join('\n')
				.replaceAll('LINE_BREAK\n', '')
		);
	if (logActivity('modmail'))
		var logMessage = await client.config.logging.webhook.send({
			threadId: client.config.logging.modmail.channelId,
			embeds: [embed],
		});

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
