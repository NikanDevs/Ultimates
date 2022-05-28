import { ApplicationCommandOptionType } from 'discord.js';
import { interactionOptions } from '../../typings/Command';

export const unbanCommand = {
	name: 'unban',
	description: 'Unbans a user that was previously banned.',
	directory: 'moderation',
	cooldown: 3000,
	permission: ['BanMembers'],
	options: [
		{
			name: 'user-id',
			description: 'The user you wish to unban.',
			type: ApplicationCommandOptionType.String,
			required: true,
			autocomplete: true,
		},
		{
			name: 'reason',
			description: 'The reason of the unban.',
			type: ApplicationCommandOptionType.String,
			required: false,
			autocomplete: true,
		},
	],
} as interactionOptions;

