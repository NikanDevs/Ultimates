import { GuildMember } from 'discord.js';
import { client } from '..';
import { type ignoreFunctionOptions, PunishmentTypes } from '../typings';

export function ignore(member: GuildMember, options: ignoreFunctionOptions): boolean {
	const interaction = options.interaction;
	const action = options.action;

	if (member.user.bot) {
		interaction.reply({
			embeds: [
				client.embeds.error(
					"You can't perform actions on bots. If necessary, use Discord's in-built functions."
				),
			],
			ephemeral: true,
		});
		return true;
	}
	if (interaction.user.id === member.user.id) {
		interaction.reply({
			embeds: [
				client.embeds.error(
					"You can't perform that action on yourself[.](https://takeb1nzyto.space/)"
				),
			],
			ephemeral: true,
		});
		return true;
	}
	if (member.id === client.config.general.ownerId) {
		interaction.reply({
			embeds: [
				client.embeds.error(
					"You don't have permissions to perform an action on the owner."
				),
			],
			ephemeral: true,
		});
		return true;
	}
	if (member.roles?.highest.position >= interaction.guild.members.me.roles?.highest.position) {
		interaction.reply({
			embeds: [
				client.embeds.error("I don't have enough permissions to perform this action."),
			],
			ephemeral: true,
		});
		return true;
	}
	if (
		(action === PunishmentTypes.Ban || action === PunishmentTypes.Softban) &&
		!member.bannable
	) {
		interaction.reply({
			embeds: [client.embeds.error("This member can't be banned.")],
			ephemeral: true,
		});
		return true;
	}
	if (action === PunishmentTypes.Kick && !member.kickable) {
		interaction.reply({
			embeds: [client.embeds.error("This member can't be kicked.")],
			ephemeral: true,
		});
		return true;
	}
	if (action === PunishmentTypes.Timeout && !member.moderatable) {
		interaction.reply({
			embeds: [
				client.embeds.error(
					"This member can't be timed out, most likely because they are an administrator."
				),
			],
			ephemeral: true,
		});
		return true;
	}
	if (member.permissions.has('Administrator')) {
		interaction.reply({
			embeds: [client.embeds.error('You can not take actions on an administrator.')],
			ephemeral: true,
		});
		return true;
	}
	if (
		(interaction.member as GuildMember).roles.highest.position <=
		member.roles.highest.position
	) {
		interaction.reply({
			embeds: [
				client.embeds.error('Your position is not high enough to perform this action.'),
			],
			ephemeral: true,
		});
		return true;
	}

	return false;
}
