import { GuildMember } from 'discord.js';
import { t } from 'i18next';
import { client } from '..';
import { type ignoreFunctionOptions, PunishmentTypes } from '../typings';

export function ignore(member: GuildMember, options: ignoreFunctionOptions): boolean {
	const interaction = options.interaction;
	const action = options.action;

	if (member.user.bot) {
		interaction.reply({
			embeds: [client.embeds.error(t('function.ignore.bot'))],
			ephemeral: true,
		});
		return true;
	}
	if (interaction.user.id === member.user.id) {
		interaction.reply({
			embeds: [t('function.ignore.yourself')],
			ephemeral: true,
		});
		return true;
	}
	if (member.roles?.highest.position >= interaction.guild.members.me.roles?.highest.position) {
		interaction.reply({
			embeds: [client.embeds.error(t('function.ignore.botPerms'))],
			ephemeral: true,
		});
		return true;
	}
	if ((action === PunishmentTypes.Ban || action === PunishmentTypes.Softban) && !member.bannable) {
		interaction.reply({
			embeds: [client.embeds.error(t('function.ignore.ban'))],
			ephemeral: true,
		});
		return true;
	}
	if (action === PunishmentTypes.Kick && !member.kickable) {
		interaction.reply({
			embeds: [client.embeds.error(t('function.ignore.kick'))],
			ephemeral: true,
		});
		return true;
	}
	if (action === PunishmentTypes.Timeout && !member.moderatable) {
		interaction.reply({
			embeds: [client.embeds.error(t('function.ignore.timeout'))],
			ephemeral: true,
		});
		return true;
	}
	if (member.permissions.has('Administrator')) {
		interaction.reply({
			embeds: [client.embeds.error(t('function.ignore.admin'))],
			ephemeral: true,
		});
		return true;
	}
	if ((interaction.member as GuildMember).roles.highest.position <= member.roles.highest.position) {
		interaction.reply({
			embeds: [client.embeds.error(t('function.ignore.userPerms'))],
			ephemeral: true,
		});
		return true;
	}

	return false;
}
