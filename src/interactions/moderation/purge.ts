import { ApplicationCommandOptionType } from 'discord.js';

export const purgeCommand = {
	name: 'purge',
	description: 'Clears out messages from the current channel.',
	directory: 'moderation',
	cooldown: 5000,
	permission: ['ManageMessages'],
	options: [
		{
			name: 'amount',
			description: 'The number of messages you wish to clear.',
			type: ApplicationCommandOptionType.User,
			required: true,
		},
		{
			name: 'user',
			description: 'Clears out the messages from a user only.',
			type: ApplicationCommandOptionType.User,
			required: false,
		},
	],
} as const;

