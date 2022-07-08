import { EmbedBuilder, TextChannel } from 'discord.js';
import { client } from '../..';
import { createAntiraidLogOptions } from '../../typings';
import { addModCase, getModCase } from '../cases/modCase';
import { generateDiscordTimestamp } from '../../utils/generateDiscordTimestamp';
import { logActivity } from './checkActivity';
import { convertTime } from '../convertTime';
import { MAX_REASON_LENGTH, punishmentExpiry } from '../../constants';
import { splitText } from '../other/splitText';
import { t } from 'i18next';
import { logsModel } from '../../models/logs';

export async function createAntiraidLog(options: createAntiraidLogOptions) {
	const currentCase = await getModCase();
	if (logActivity('mod')) await addModCase();

	const embed = new EmbedBuilder()
		.setAuthor({
			name: `Antiraid | Case: #${currentCase}`,
			iconURL: client.user.displayAvatarURL(),
		})
		.setColor('#e32727')
		.setDescription(
			[
				`• **Action:** Antiraid`,
				`• **Affected:** ${options.affected.toLocaleString()} member${
					options.affected === 1 ? '' : 's'
				}`,
				`• **Moderator:** ${
					options.moderator.id !== client.user.id
						? `${options.moderator.tag} • ${options.moderator.id}`
						: 'Automatic'
				}`,
				`• **Date:** ${generateDiscordTimestamp(new Date(), 'Short Date/Time')}`,
				`• **Reason:** ${
					splitText(options.reason, MAX_REASON_LENGTH) ?? t('common.noReason')
				}`,
				`• **Registered:** in the past ${convertTime(options.registered)}`,
				`• **Joined:** in the past ${convertTime(options.registered)}\n`,
				`[View the results](${options.results})`,
			].join('\n')
		);

	if (!logActivity('mod')) return;
	var logMessage = await client.config.webhooks.mod.send({ embeds: [embed] });

	var findMessage = await (
		client.channels.cache.get(logMessage.channel_id) as TextChannel
	).messages.fetch(logMessage.id);

	const newLogData = new logsModel({
		_id: currentCase,
		url: findMessage.url,
		expire: punishmentExpiry,
	});
	await newLogData.save();
}

