import { ApplicationCommandOptionType } from 'discord.js';
import { interactionOptions } from '../../typings';

export const unbanCommand = {
	name: 'unban',
	description: 'Unban a user which is currently banned',
	directory: 'moderation',
	cooldown: 3000,
	permission: ['BanMembers'],
	options: [
		{
			name: 'user',
			description: 'The user you want to unban',
			type: ApplicationCommandOptionType.String,
			required: true,
			autocomplete: true,
		},
		{
			name: 'reason',
			description: 'The reason of this unban',
			type: ApplicationCommandOptionType.String,
			required: false,
			autocomplete: true,
		},
	],
} as interactionOptions;

