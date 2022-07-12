import { EmbedBuilder, resolveColor, TextChannel } from 'discord.js';
import { client } from '../..';
import { logsModel } from '../../models/logs';
import {
	type createModLogOptions,
	PunishmentTypes,
	punishmentTypeEmbedColors,
} from '../../typings';
import { addModCase, getModCase } from '../cases/modCase';
import { generateDiscordTimestamp } from '../../utils/generateDiscordTimestamp';
import { logActivity } from './checkActivity';
import { convertTime } from '../convertTime';
import { MAX_REASON_LENGTH } from '../../constants';
import { getUrlFromCase } from '../cases/getURL';
import { capitalize } from '../other/capitalize';
import { splitText } from '../other/splitText';
import { t } from 'i18next';

export async function createModLog(options: createModLogOptions) {
	const revoke: boolean = options.revoke ? options.revoke : false;
	const currentCase = await getModCase();
	if (logActivity('mod')) await addModCase();

	const embed = new EmbedBuilder()
		.setAuthor({
			name: ` ${
				revoke ? 'Revoke' : options.update ? 'Update' : capitalize(options.action)
			} | Case: #${revoke ? options.referencedPunishment.case : currentCase}`,
			iconURL: client.user.displayAvatarURL(),
		})
		.setColor(
			revoke
				? resolveColor('#b04d46')
				: options.update
				? client.cc.invisible
				: resolveColor(punishmentTypeEmbedColors[options.action])
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
				`• **Action:** ${capitalize(options.action)}`,
				`${
					options.duration
						? `• **Duration:** ${convertTime(options.duration)}`
						: 'LINE_BREAK'
				}`,
				`• **Member:** ${options.user.tag} • ${options.user.id}`,
				`• **Moderator:** ${
					options.moderator.id !== client.user.id
						? `${options.moderator.tag} • ${options.moderator.id}`
						: 'Automatic'
				}`,
				`• **Date:** ${generateDiscordTimestamp(new Date(), 'Short Date/Time')}`,
				`• **Reason${options.update ? ' [U]' : ''}:** ${
					splitText(options.reason, MAX_REASON_LENGTH) ?? t('common.noReason')
				}`,
			]
				.join('\n')
				.replaceAll('\nLINE_BREAK', '')
		);

	if (!logActivity('mod')) return;
	var logMessage = await client.config.webhooks.mod.send({ embeds: [embed] });
	if (options.update)
		return `https://discord.com/channels/${process.env.GUILD_ID}/${logMessage.channel_id}/${logMessage.id}`;

	if (
		options.action === PunishmentTypes.Unmute ||
		options.action === PunishmentTypes.Unban ||
		revoke ||
		options.update
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
