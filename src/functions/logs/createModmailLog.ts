import { CommandInteraction, Message, TextChannel, User, Util } from 'discord.js';
import { client } from '../..';
import { modmailModel } from '../../models/modmail';
import { ModmailActionType, ModmailTicketData } from '../../typings/Modmail';
import { addModmailCase } from '../cases/ModmailCase';
import { modmailLogging } from '../../webhooks';

interface ticketOptions {
	type: 'DIRECT' | 'REQUEST';
	channel: TextChannel;
}
interface options {
	action: ModmailActionType;
	ticketId?: Number;
	user: User;
	moderator?: User;
	ticket?: ticketOptions;
	reason?: string;
	transcript?: string;
	referencedCaseUrl?: string;
	actionMessage?: Message;
}

/** Creates a new modmail log and post the log to the modmail webhook. */
export async function createModmailLog(
	interaction: CommandInteraction | Message,
	options: options
) {
	enum colors {
		'OPEN' = '#95b874',
		'CLOSE' = '#b89b74',
		'BLACKLIST_ADD' = '#b04646',
		'BLACKLIST_REMOVE' = '#60b3b1',
	}

	const ticket = options.ticket;

	const embed = client.util
		.embed()
		.setAuthor({
			name: `Modmail | ${
				options.action === ModmailActionType.Open
					? ticket.type === 'DIRECT'
						? 'Direct Open'
						: 'Open Request'
					: client.util.capitalize(options.action)
			}`,
			iconURL: client.user.displayAvatarURL(),
		})
		.setColor(Util.resolveColor(colors[options.action]))
		.setDescription(
			[
				`${options.ticketId ? `• **Ticket:** #${options.ticketId}` : ''}\n`,
				`• **Action:** ${client.util.capitalize(options.action)}`,
				`• **Member:** ${options.user.tag} • ${options.user.id}`,
				options.action === ModmailActionType.Open
					? `• **Channel:** ${ticket.channel}`
					: 'SKIP',
				options.moderator
					? `• **Moderator:** ${
							options.moderator.id !== client.user.id
								? `${options.moderator.tag} • ${options.moderator.id}`
								: 'Automatic'
					  }`
					: 'SKIP',
				`• **Date:** <t:${~~(Date.now() / 1000)}:f>`,
				`• **Reason:** ${options.reason || 'No reason provided'}`,
				`\n${
					!options.referencedCaseUrl
						? options.actionMessage
							? `[Take me there!](${options.actionMessage.url})`
							: ''
						: options.action === ModmailActionType.Close
						? `[Take me to the creation](${options.referencedCaseUrl}) • [View transcript](${options.transcript})`
						: options.action === ModmailActionType.BlacklistRemove
						? `[Take me to the blacklist](${options.referencedCaseUrl})`
						: ''
				}`,
			]
				.join('\n')
				.replaceAll('SKIP\n', '')
		);
	var logMessage = await modmailLogging.send({ embeds: [embed] });

	if (options.action === ModmailActionType.Open) {
		await addModmailCase();
		let findMessage = await (
			client.channels.cache.get(logMessage.channel_id) as TextChannel
		).messages.fetch(logMessage.id);
		await modmailModel.findByIdAndUpdate('substance', {
			$push: {
				openedTickets: {
					id: options.ticketId,
					userId: options.user.id,
					type: ticket.type.toUpperCase(),
					url: findMessage.url,
					createdAt: ticket.channel.createdAt,
				},
			},
		});
	} else if (options.action === ModmailActionType.BlacklistAdd) {
		let findMessage = await (
			client.channels.cache.get(logMessage.channel_id) as TextChannel
		).messages.fetch(logMessage.id);
		await modmailModel.findByIdAndUpdate(options.user.id, { $set: { url: findMessage.url } });
	} else if (options.action === ModmailActionType.Close) {
		const openedTickets: [] = (await modmailModel.findById('substance')).openedTickets;
		const ticketData = (openedTickets as ModmailTicketData[]).find(
			(data) => data.userId === options.user.id
		);

		await modmailModel.findByIdAndUpdate('substance', {
			$pull: { openedTickets: { userId: ticketData.userId } },
		});
	}
}
