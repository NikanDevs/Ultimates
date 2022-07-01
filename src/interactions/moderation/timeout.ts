import { ApplicationCommandOptionType } from 'discord.js';
import { interactionOptions } from '../../typings';

export const timeoutCommand = {
	name: 'timeout',
	description: 'Time a member out and disallow them from any activity in the server',
	directory: 'moderation',
	cooldown: 3000,
	permission: ['ModerateMembers'],
	options: [
		{
			name: 'member',
			description: 'The member you want to timeout',
			type: ApplicationCommandOptionType.User,
			required: true,
		},
		{
			name: 'duration',
			description: 'The duration of this timeout',
			type: ApplicationCommandOptionType.String,
			required: false,
			autocomplete: true,
		},
		{
			name: 'reason',
			description: 'The reason of this timeout',
			type: ApplicationCommandOptionType.String,
			required: false,
			autocomplete: true,
		},
	],
} as interactionOptions;

