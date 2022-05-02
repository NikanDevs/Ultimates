import { ApplicationCommandOptionType, GuildMember, PermissionResolvable, Role } from 'discord.js';
import { getsIgnored } from '../../functions/getsIgnored';
import { Command } from '../../structures/Command';

export default new Command({
	name: 'role',
	description: 'Role subcommand.',
	directory: 'moderation',
	cooldown: 3000,
	permission: ['ManageRoles'],
	options: [
		{
			name: 'edit',
			description: 'Adds or removes a role based on its current status.',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'member',
					description: 'The member you wish to take action on.',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: 'role',
					description: 'The role you wish to add or remove.',
					type: ApplicationCommandOptionType.Role,
					required: true,
				},
			],
		},
	],

	excute: async ({ client, interaction, options }) => {
		const getSubCommand = options.getSubcommand();

		if (getSubCommand === 'edit') {
			const member = options.getMember('member') as GuildMember;
			const role = options.getRole('role') as Role;
			var alreadyHas: boolean = false;

			if (getsIgnored(interaction, member)) return;
			if (role.position > interaction.guild.me.roles.highest.position || role.managed)
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
