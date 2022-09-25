import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, GuildMember } from 'discord.js';
import { t } from 'i18next';
import { client } from '..';
import { sendModDMOptions } from '../typings';
import { PunishmentTypes } from '../typings';
import { generateDiscordTimestamp } from './generateDiscordTimestamp';

export async function sendModDM(member: GuildMember, options: sendModDMOptions) {
	const automod = options.automod ? true : false;
	const appeal = options.appeal ?? true;

	const embed = new EmbedBuilder()
		.setAuthor({
			name: member.guild.name,
			iconURL: member.guild.iconURL(),
		})
		.setTitle(
			t('function.sendModDM.title', { action: t('command.mod.' + options.action.toLowerCase() + '.past') })
		)
		.setColor(client.cc.invisible)
		.addFields([
			automod
				? {
						name: t('function.sendModDM.type'),
						value: t('function.sendModDM.automod'),
						inline: true,
				  }
				: {
						name: t('function.sendModDM.punishmentId'),
						value: options.punishment._id,
						inline: true,
				  },
			{
				name:
					options.action === PunishmentTypes.Timeout
						? t('function.sendModDM.ends')
						: t('function.sendModDM.expires'),
				value: `${
					options.expire
						? generateDiscordTimestamp(options.expire)
						: options.action === PunishmentTypes.Kick
						? t('function.sendModDM.joinable')
						: t('function.sendModDM.permanent')
				}`,
				inline: true,
			},
			{
				name: t('function.sendModDM.reason'),
				value: options.punishment.reason ?? t('common.noReason'),
				inline: false,
			},
		]);

	const appealButton = new ActionRowBuilder<ButtonBuilder>().addComponents([
		new ButtonBuilder()
			.setURL(client.config.general.appealLink || 'https://discord.com')
			.setStyle(ButtonStyle.Link)
			.setLabel(t('function.sendModDM.appeal')),
	]);
	let appealComponent: ActionRowBuilder<ButtonBuilder>[] = [];
	if (
		(options.action === PunishmentTypes.Ban || options.action === PunishmentTypes.Softban) &&
		client.config.general.appealLink?.length !== undefined &&
		appeal
	)
		appealComponent = [appealButton];

	await member.send({ embeds: [embed], components: appealComponent }).catch(() => {});
}
