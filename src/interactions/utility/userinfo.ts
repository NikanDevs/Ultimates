import { ApplicationCommandOptionType } from 'discord.js';

export const userinfoCommand = {
	name: 'userinfo',
	description: 'Shows information for a user.',
	directory: 'utility',
	cooldown: 3000,
	permission: ['ManageMessages'],
	options: [
		{
			name: 'user',
			description: 'The user you wish to see information for.',
			type: ApplicationCommandOptionType.User,
			required: false,
		},
	],
} as const;

