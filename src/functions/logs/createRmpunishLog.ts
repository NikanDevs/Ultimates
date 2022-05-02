import { CommandInteraction, Message, User, Util } from 'discord.js';
import { client } from '../..';
import { logsModel } from '../../models/logs';
import { RmPunishmentType } from '../../typings/PunishmentType';
import { rmpunishmentLogging } from '../../webhooks';

interface options {
	type: RmPunishmentType;
	user: User;
	moderator?: User;
	punishment: any;
	reason?: string;
	actionMessage?: Message;
}

async function getUrlFromCase(tofindCase: string | number) {
	const data = await logsModel.findById(`${tofindCase}`);

	return data ? data.url : 'https://discord.com/404';
}

export async function createRmPunishLog(
	interaction: CommandInteraction | Message,
	options: options
) {
	enum colors {
		'REVOKE' = '#b04d46',
		'EXPIRE' = '#d4a383',
	}

	const punishment = options.punishment;
	const embed = client.util
		.embed()
		.setAuthor({
			name: `Case: #${options.punishment.case} | ${client.util.capitalize(options.type)}`,
			iconURL: client.user.displayAvatarURL(),
		})
		.setColor(Util.resolveColor(colors[options.type]));

	switch (options.type) {
		case RmPunishmentType.Expire:
			embed.setDescription(
				[
					`• **ID:** ${punishment._id}\n`,
					`• **Type:** ${client.util.capitalize(punishment.type)}`,
					`• **User:** ${options.user.tag} • ${options.user.id}`,
					`• **Date:** <t:${~~(+punishment.timestamp / 1000)}:f>`,
					`\n[Take me to case #${punishment.case}](${await getUrlFromCase(
						punishment.case
					)})`,
				].join('\n')
			);
			break;
		case RmPunishmentType.Revoke:
			embed.setDescription(
				[
					`• **ID:** ${punishment._id}\n`,
					`• **Type:** ${client.util.capitalize(punishment.type)}`,
					`• **User:** ${options.user.tag} • ${options.user.id}`,
					`• **Moderator:** ${options.moderator.tag} • ${options.moderator.id}`,
					`• **Date:** <t:${~~(Date.now() / 1000)}:f>`,
					`• **Reason:** ${options.reason}\n`,
					[
						`[Take me there!](${options.actionMessage.url})`,
						`[Take me to case #${punishment.case}](${await getUrlFromCase(
							punishment.case
						)})`,
					].join(' • '),
				].join('\n')
			);
			break;
	}

	await rmpunishmentLogging.send({ embeds: [embed] }).then(async () => {
		await logsModel.findByIdAndDelete(options.punishment.case);
	});
}
