import { ApplicationCommandOptionType } from 'discord.js';
import { interactionOptions } from '../../typings/Command';

export const warnCommand = {
	name: 'warn',
	description: 'Warns a member.',
	directory: 'moderation',
	cooldown: 3000,
	permission: ['ManageMessages'],
	options: [
		{
			name: 'member',
			description: 'The member you wish to warn.',
			type: ApplicationCommandOptionType.User,
			required: true,
		},
		{
			name: 'reason',
			description: 'The reason for your warning.',
			type: ApplicationCommandOptionType.String,
			required: true,
			autocomplete: true,
		},
	],
} as interactionOptions;

