import {
	ActionRow,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	GuildMember,
	MessageActionRowComponent,
} from 'discord.js';
import { client } from '..';
import { PunishmentType } from '../typings/PunishmentType';
import { generateDiscordTimestamp } from './generateDiscordTimestamp';
import { default_config } from '../json/moderation.json';
import { guild as guildConfig } from '../json/config.json';

interface options {
	action: PunishmentType;
	expire?: Date;
	punishment: any;
	automod?: boolean;
}
export async function sendModDM(member: GuildMember, options: options) {
	enum pastForm {
		'WARN' = 'warned',
		'BAN' = 'banned',
		'KICK' = 'kicked',
		'TIMEOUT' = 'timed out',
		'UNBAN' = 'unbanned',
		'SOFTBAN' = 'soft banned',
	}
	enum suffix {
		'WARN' = 'in',
		'BAN' = 'from',
		'KICK' = 'from',
		'TIMEOUT' = 'in',
		'UNBAN' = 'from',
		'SOFTBAN' = 'from',
	}

	const automod = options.automod ? true : false;

	const embed = new EmbedBuilder()
		.setAuthor({
			name: client.user.username,
			iconURL: client.user.displayAvatarURL(),
		})
		.setTitle(
			`You were ${pastForm[options.action]} ${suffix[options.action]} ` + member.guild.name
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
				name: options.action === PunishmentType.Timeout ? 'Ends' : 'Expires',
				value: `${
					options.expire
						? generateDiscordTimestamp(options.expire)
						: options.action === PunishmentType.Kick
						? 'You can join back'
						: 'Permanent'
				}`,
				inline: true,
			},
			{
				name: 'Reason',
				value: options.punishment.reason || default_config.reason,
				inline: false,
			},
		]);

	const appealButton = new ActionRowBuilder<ButtonBuilder>().addComponents([
		new ButtonBuilder()
			.setURL(client.config.general.guild.appealLink)
			.setStyle(ButtonStyle['Link'])
			.setLabel('Appeal'),
	]);
	let appealComponent: ActionRowBuilder<ButtonBuilder>[] = [];
	if (
		(options.action === PunishmentType.Ban || options.action === PunishmentType.Softban) &&
		client.config.general.guild.appealLink?.length !== undefined
	)
		appealComponent = [appealButton];

	await member.send({ embeds: [embed], components: appealComponent }).catch(() => {});
}

