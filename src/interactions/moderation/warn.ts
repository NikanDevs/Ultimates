import { ApplicationCommandOptionType } from 'discord.js';
import { MAX_REASON_LENGTH } from '../../constants';
import { interactionOptions } from '../../typings';

export const warnCommand = {
	name: 'warn',
	description: 'Warn a member',
	directory: 'moderation',
	cooldown: 3000,
	permission: ['ManageMessages'],
	options: [
		{
			name: 'member',
			description: 'The member you want to warn',
			type: ApplicationCommandOptionType.User,
			required: true,
		},
		{
			name: 'reason',
			description: 'The reason for this warning',
			type: ApplicationCommandOptionType.String,
			required: true,
			min_length: 1,
			max_length: MAX_REASON_LENGTH,
			autocomplete: true,
		},
	],
} as interactionOptions;
