import { ApplicationCommandOptionType } from 'discord.js';
import { interactionOptions } from '../../typings/Command';

export const roleCommand = {
	name: 'role',
	description: "Take an action on a member's roles",
	directory: 'moderation',
	cooldown: 3000,
	permission: ['ManageRoles'],
	options: [
		{
			name: 'edit',
			description: 'Add or remove a role based on its current status',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'member',
					description: 'The member you want to take action on',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: 'role',
					description: 'The role you want to add or remove',
					type: ApplicationCommandOptionType.Role,
					required: true,
				},
			],
		},
	],
} as interactionOptions;

