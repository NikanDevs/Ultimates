import { ApplicationCommandOptionType } from 'discord.js';

export const roleCommand = {
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
} as const;

