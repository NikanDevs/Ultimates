import { EmbedBuilder, resolveColor, TextChannel } from 'discord.js';
import { client } from '../..';
import { logsModel } from '../../models/logs';
import { type createModLogOptions, PunishmentTypes, punishmentTypeEmbedColors } from '../../typings';
import { addModCase, getModCase } from '../cases/modCase';
import { generateDiscordTimestamp } from '../../utils/generateDiscordTimestamp';
import { logActivity } from './checkActivity';
import { convertTime } from '../convertTime';
import { getUrlFromCase } from '../cases/getURL';
import { capitalize } from '../other/capitalize';
import { t } from 'i18next';

export async function createModLog(options: createModLogOptions) {
	const revoke: boolean = options.revoke ? options.revoke : false;
	const currentCase = await getModCase();
	if (logActivity('mod')) await addModCase();

	const embed = new EmbedBuilder()
		.setAuthor({
			name: `${t('log.mod.title', {
				action: revoke
					? t('log.mod.revoke')
					: options.update
					? t('log.mod.update')
					: capitalize(options.action),
				case: currentCase,
			})}`,
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
						? t('log.mod.id', { id: options.punishmentId })
						: t('log.mod.reference', {
								case: options.referencedPunishment.case,
								url: await getUrlFromCase(options.referencedPunishment.case),
						  })
				}\n`,
				t('log.mod.action', { action: capitalize(options.action) }),
				`${
					options.duration
						? t('log.mod.duration', { duration: convertTime(options.duration) })
						: 'LINE_BREAK'
				}`,
				t('log.mod.member', { member: options.user.toString(), id: options.user.id }),
				t('log.mod.moderator', {
					moderator:
						options.moderator.id !== client.user.id
							? `${options.moderator.tag} • ${options.moderator.id}`
							: t('log.automatic'),
				}),
				t('log.mod.date', { date: generateDiscordTimestamp(new Date(), 'Short Date/Time') }),
				t('log.mod.reason', { reason: options.reason ?? t('common.noReason') }),
			]
				.join('\n')
				.replaceAll('\nLINE_BREAK', '')
		);

	if (!logActivity('mod')) return;
	var logMessage = await client.config.logging.webhook.send({
		threadId: client.config.logging.mod.channelId,
		embeds: [embed],
	});
	if (options.update || revoke)
		return `https://discord.com/channels/${process.env.GUILD_ID}/${logMessage.channel_id}/${logMessage.id}`;

	if (
		options.action === PunishmentTypes.Unmute ||
		options.action === PunishmentTypes.Unban ||
		revoke ||
		options.update
	)
		return;

	var findMessage = await (client.channels.cache.get(logMessage.channel_id) as TextChannel).messages.fetch(
		logMessage.id
	);
	const newLogData = new logsModel({
		_id: currentCase,
		url: findMessage.url,
		expire: options.expire ? options.expire : null,
	});
	await newLogData.save();
}
