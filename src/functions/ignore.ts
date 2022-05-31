import { CommandInteraction, GuildMember } from 'discord.js';
import { ownerId } from '../json/config.json';
import { client } from '..';
import { PunishmentType } from '../typings/PunishmentType';

interface options {
	interaction: CommandInteraction;
	action: PunishmentType;
}

export function ignore(member: GuildMember, options: options): boolean {
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
					"You can't punish yourself[,](https://takeb1nzyto.space/) that's not how I work."
				),
			],
			ephemeral: true,
		});
		return true;
	}
	if (member.id === ownerId) {
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
	if (member.roles?.highest.position >= interaction.guild.me.roles?.highest.position) {
		interaction.reply({
			embeds: [
				client.embeds.error("I don't have enough permissions to perform this action."),
			],
			ephemeral: true,
		});
		return true;
	}
	if ((action === PunishmentType.Ban || action === PunishmentType.Softban) && !member.bannable) {
		interaction.reply({
			embeds: [client.embeds.error("This member can't be banned.")],
			ephemeral: true,
		});
		return true;
	}
	if (action === PunishmentType.Kick && !member.kickable) {
		interaction.reply({
			embeds: [client.embeds.error("This member can't be kicked.")],
			ephemeral: true,
		});
		return true;
	}
	if (action === PunishmentType.Timeout && !member.moderatable) {
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
