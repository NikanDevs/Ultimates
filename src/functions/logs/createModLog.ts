import { TextChannel, User, Util } from 'discord.js';
import { client } from '../..';
import { logsModel } from '../../models/logs';
import { PunishmentType } from '../../typings/PunishmentType';
import { addModCase, getModCase } from '../cases/modCase';
import { moderationLogging } from '../../webhooks';

interface options {
	action: PunishmentType;
	punishmentId?: string;
	user: User;
	moderator: User;
	reason: string;
	duration?: number;
	referencedPunishment?: any;
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
	}

	const currentCase = await getModCase();
	await addModCase();
	const embed = client.util
		.embed()
		.setAuthor({
			name: ` ${client.util.capitalize(options.action)} | Case: #${currentCase}`,
			iconURL: client.user.displayAvatarURL(),
		})
		.setColor(Util.resolveColor(colors[options.action]))
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
					options.action === PunishmentType.Timeout
						? `• ${client.util.convertTime(options.duration / 1000)}`
						: ''
				}`,
				`• **Member:** ${options.user.tag} • ${options.user.id}`,
				`• **Moderator:** ${
					options.moderator.id !== client.user.id
						? `${options.moderator.tag} • ${options.moderator.id}`
						: 'Automatic'
				}`,
				`• **Date:** <t:${~~(Date.now() / 1000)}:f>`,
				`• **Reason:** ${options.reason}`,
				``,
			].join('\n')
		);
	var logMessage = await moderationLogging.send({ embeds: [embed] });

	var findMessage = await (
		client.channels.cache.get(logMessage.channel_id) as TextChannel
	).messages.fetch(logMessage.id);
	const newLogData = new logsModel({
		_id: currentCase,
		url: findMessage.url,
	});
	await newLogData.save();
}
