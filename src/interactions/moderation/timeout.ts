import { ApplicationCommandOptionType } from 'discord.js';

export const timeoutCommand = {
	name: 'timeout',
	description: 'Times out a member in the server.',
	directory: 'moderation',
	cooldown: 3000,
	permission: ['ModerateMembers'],
	options: [
		{
			name: 'member',
			description: 'The member you wish to timeout.',
			type: ApplicationCommandOptionType.User,
			required: true,
		},
		{
			name: 'duration',
			description: 'The duration of this timeout.',
			type: ApplicationCommandOptionType.String,
			required: false,
		},
		{
			name: 'reason',
			description: 'The reason of this timeout.',
			type: ApplicationCommandOptionType.String,
			required: false,
			autocomplete: true,
		},
	],
} as const;

