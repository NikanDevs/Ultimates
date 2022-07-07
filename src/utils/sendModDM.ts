import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	GuildMember,
} from 'discord.js';
import { t } from 'i18next';
import { client } from '..';
import { punishmentTypeNames, punismentTypeNamesSuffixes, sendModDMOptions } from '../typings';
import { PunishmentTypes } from '../typings';
import { generateDiscordTimestamp } from './generateDiscordTimestamp';

export async function sendModDM(member: GuildMember, options: sendModDMOptions) {
	const automod = options.automod ? true : false;

	const embed = new EmbedBuilder()
		.setAuthor({
			name: client.user.username,
			iconURL: client.user.displayAvatarURL(),
		})
		.setTitle(
			`You were ${punishmentTypeNames[options.action]} ${
				punismentTypeNamesSuffixes[options.action]
			} ` + member.guild.name
		)
		.setColor(client.cc.invisible)
		.addFields([
			automod
				? {
						name: 'Type',
						value: 'Automod',
						inline: true,
				  }
				: {
						name: 'Punishment ID',
						value: options.punishment._id,
						inline: true,
				  },
			{
				name: options.action === PunishmentTypes.Timeout ? 'Ends' : 'Expires',
				value: `${
					options.expire
						? generateDiscordTimestamp(options.expire)
						: options.action === PunishmentTypes.Kick
						? 'You can join back'
						: 'Permanent'
				}`,
				inline: true,
			},
			{
				name: 'Reason',
				value: options.punishment.reason ?? t('common.noReason'),
				inline: false,
			},
		]);

	const appealButton = new ActionRowBuilder<ButtonBuilder>().addComponents([
		new ButtonBuilder()
			.setURL(client.config.general.guild.appealLink)
			.setStyle(ButtonStyle.Link)
			.setLabel('Appeal'),
	]);
	let appealComponent: ActionRowBuilder<ButtonBuilder>[] = [];
	if (
		(options.action === PunishmentTypes.Ban || options.action === PunishmentTypes.Softban) &&
		client.config.general.guild.appealLink?.length !== undefined
	)
		appealComponent = [appealButton];

	await member.send({ embeds: [embed], components: appealComponent }).catch(() => {});
}

