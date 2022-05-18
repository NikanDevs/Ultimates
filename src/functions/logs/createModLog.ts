import { TextChannel, User, Util } from 'discord.js';
import { client } from '../..';
import { logsModel } from '../../models/logs';
import { PunishmentType } from '../../typings/PunishmentType';
import { addModCase, getModCase } from '../cases/modCase';
import { moderationLogging } from '../../webhooks';
import { generateDiscordTimestamp } from '../../utils/generateDiscordTimestamp';
import { default_config } from '../../json/moderation.json';

interface options {
	action: PunishmentType;
	punishmentId?: string;
	user: User;
	moderator: User;
	reason: string;
	duration?: number;
	referencedPunishment?: any;
	expire?: Date;
	revoke?: boolean;
}

async function getUrlFromCase(tofindCase: string | number) {
	const data = await logsModel.findById(`${tofindCase}`);

	return data ? data.url : 'https://discord.com/404';
}

export async function createModLog(options: options) {
	enum colors {
		'WARN' = '#d4c03f',
		'TIMEOUT' = '#f5a742',
		'BAN' = '#cc423d',
		'KICK' = '#db644f',
		'UNMUTE' = '#2F3136',
		'UNBAN' = '#68b7bd',
		'SOFTBAN' = '#f07046',
	}

	const revoke: boolean = options.revoke ? options.revoke : false;
	const currentCase = await getModCase();
	await addModCase();
	const embed = client.util
		.embed()
		.setAuthor({
			name: ` ${revoke ? 'Revoke' : client.util.capitalize(options.action)} | Case: #${
				revoke ? options.referencedPunishment.case : currentCase
			}`,
			iconURL: client.user.displayAvatarURL(),
		})
		.setColor(
			revoke ? Util.resolveColor('#b04d46') : Util.resolveColor(colors[options.action])
		)
		.setDescription(
			[
				`${
					!options.referencedPunishment
						? `• **ID:** ${options.punishmentId}`
						: `• **Referenced to:** [Case #${
								options.referencedPunishment.case
						  }](${await getUrlFromCase(options.referencedPunishment.case)})`
				}\n`,
				`• **Action:** ${client.util.capitalize(options.action)} ${
					options.duration
						? `• ${client.util.convertTime(options.duration / 1000)}`
						: ''
				}`,
				`• **Member:** ${options.user.tag} • ${options.user.id}`,
				`• **Moderator:** ${
					options.moderator.id !== client.user.id
						? `${options.moderator.tag} • ${options.moderator.id}`
						: 'Automatic'
				}`,
				`• **Date:** ${generateDiscordTimestamp(new Date(), 'Short Date/Time')}`,
				`• **Reason:** ${options.reason || default_config.reason}`,
			].join('\n')
		);
	var logMessage = await moderationLogging.send({ embeds: [embed] });

	if (
		options.action === PunishmentType.Unmute ||
		options.action === PunishmentType.Unban ||
		revoke
	)
		return;

	var findMessage = await (
		client.channels.cache.get(logMessage.channel_id) as TextChannel
	).messages.fetch(logMessage.id);
	const newLogData = new logsModel({
		_id: currentCase,
		url: findMessage.url,
		expire: options.expire ? options.expire : null,
	});
	await newLogData.save();
}
