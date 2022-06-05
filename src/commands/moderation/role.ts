import { GuildMember, PermissionResolvable, Role } from 'discord.js';
import { ignore } from '../../functions/ignore';
import { interactions } from '../../interactions';
import { Command } from '../../structures/Command';
import { PunishmentType } from '../../typings/PunishmentType';

export default new Command({
	interaction: interactions.role,
	excute: async ({ client, interaction, options }) => {
		const getSubCommand = options.getSubcommand();

		if (getSubCommand === 'edit') {
			const member = options.getMember('member') as GuildMember;
			const role = options.getRole('role') as Role;
			var alreadyHas: boolean = false;

			if (ignore(member, { interaction, action: PunishmentType.Unknown })) return;
			if (
				role.position > interaction.guild.members.me.roles.highest.position ||
				role.managed
			)
				return interaction.reply({
					embeds: [
						client.embeds.error(
							"I don't have enough permissions to manage that role."
						),
					],
					ephemeral: true,
				});
			if (member.roles.cache.has(role.id)) alreadyHas = true;
			if (
				[
					'ManageMessages',
					'ModerateMembers',
					'BanMembers',
					'KickMembers',
					'ManageGuild',
					'ManageChannels',
					'Administrator',
				].some((permission) => role.permissions.has(permission as PermissionResolvable))
			)
				return interaction.reply({
					embeds: [
						client.embeds.error(
							`Woah! That role has some moderation powers, try ${
								alreadyHas ? 'removing' : 'adding'
							} them yourself.`
						),
					],
					ephemeral: true,
				});

			switch (alreadyHas) {
				case false:
					await member.roles.add(role);
					await interaction.reply({
						embeds: [
							client.embeds.success(`${member} was added the role ${role}`),
						],
					});
					break;
				case true:
					await member.roles.remove(role);
					await interaction.reply({
						embeds: [
							client.embeds.success(`${member} was removed the role ${role}`),
						],
					});
					break;
			}
		}
	},
});
