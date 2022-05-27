import { ApplicationCommandOptionType } from 'discord.js';

export const kickCommand = {
	name: 'kick',
	description: 'Kicks a member from the server.',
	directory: 'moderation',
	cooldown: 300,
	permission: ['KickMembers'],
	options: [
		{
			name: 'member',
			description: 'The member you wish to kick.',
			type: ApplicationCommandOptionType.User,
			required: true,
		},
		{
			name: 'reason',
			description: 'The reason of this kick.',
			type: ApplicationCommandOptionType.String,
			required: false,
			autocomplete: true,
		},
	],
} as const;

