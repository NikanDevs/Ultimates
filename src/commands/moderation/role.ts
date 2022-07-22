import { GuildMember, PermissionResolvable, Role } from 'discord.js';
import { t } from 'i18next';
import { ignore } from '../../functions/ignore';
import { interactions } from '../../interactions';
import { Command } from '../../structures/Command';
import { PunishmentTypes } from '../../typings';

export default new Command({
	interaction: interactions.role,
	excute: async ({ client, interaction, options }) => {
		const getSubCommand = options.getSubcommand();

		if (getSubCommand === 'edit') {
			const member = options.getMember('member') as GuildMember;
			const role = options.getRole('role') as Role;

			if (!member)
				return interaction.reply({
					embeds: [client.embeds.error(t('common.errors.invalidMember'))],
					ephemeral: true,
				});

			if (ignore(member, { interaction, action: PunishmentTypes.Unknown })) return;
			if (role.position > interaction.guild.members.me.roles.highest.position || role.managed)
				return interaction.reply({
					embeds: [client.embeds.error("I don't have enough permissions to manage that role.")],
					ephemeral: true,
				});
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
								member.roles.cache.has(role.id) ? 'removing' : 'adding'
							} it yourself.`
						),
					],
					ephemeral: true,
				});

			switch (member.roles.cache.has(role.id)) {
				case false:
					await member.roles.add(role);
					await interaction.reply({
						embeds: [client.embeds.success(`${role} was added to ${member}`)],
					});
					break;
				case true:
					await member.roles.remove(role);
					await interaction.reply({
						embeds: [client.embeds.success(`${role} was removed from ${member}`)],
					});
					break;
			}
		}
	},
});
