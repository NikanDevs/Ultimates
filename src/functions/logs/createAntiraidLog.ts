import { EmbedBuilder, TextChannel } from 'discord.js';
import { client } from '../..';
import { createAntiraidLogOptions } from '../../typings';
import { addModCase, getModCase } from '../cases/modCase';
import { generateDiscordTimestamp } from '../../utils/generateDiscordTimestamp';
import { logActivity } from './checkActivity';
import { convertTime } from '../convertTime';
import { punishmentExpiry } from '../../constants';
import { t } from 'i18next';
import { logsModel } from '../../models/logs';

export async function createAntiraidLog(options: createAntiraidLogOptions) {
	const currentCase = await getModCase();
	if (logActivity('mod')) await addModCase();

	const embed = new EmbedBuilder()
		.setAuthor({
			name: t('log.antiraid.title', { case: currentCase }),
			iconURL: client.user.displayAvatarURL(),
		})
		.setColor('#e32727')
		.setDescription(
			[
				t('log.antiraid.action', { action: 'Antiraid' }),
				t('log.antiraid.affected', { count: options.affected }),
				t('log.antiraid.moderator', {
					moderator:
						options.moderator.id !== client.user.id
							? `${options.moderator.tag} • ${options.moderator.id}`
							: t('log.automatic'),
				}),
				t('log.antiraid.date', { date: generateDiscordTimestamp(new Date(), 'Short Date/Time') }),
				t('log.antiraid.reason', { reason: options.reason ?? t('common.noReason') }),
				t('log.antiraid.registered', { date: convertTime(options.registered) }),
				`${t('log.antiraid.joined', { date: convertTime(options.joined) })}\n`,
				t('log.antiraid.results', { url: options.results }),
			].join('\n')
		);

	if (!logActivity('mod')) return;
	var logMessage = await client.config.logging.webhook.send({
		threadId: client.config.logging.mod.channelId,
		embeds: [embed],
	});

	var findMessage = await (client.channels.cache.get(logMessage.channel_id) as TextChannel).messages.fetch(
		logMessage.id
	);

	const newLogData = new logsModel({
		_id: currentCase,
		url: findMessage.url,
		expire: punishmentExpiry,
		antiraid: true,
	});
	await newLogData.save();
}
