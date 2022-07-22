import { ApplicationCommandOptionType } from 'discord.js';
import { interactionOptions } from '../../typings';

export const configureCommand = {
	name: 'configure',
	description: 'Configure different modules of the bot',
	directory: 'utility',
	cooldown: 10000,
	permission: ['Administrator'],
	options: [
		{
			name: 'module',
			description: 'The module you want to configure',
			type: ApplicationCommandOptionType.String,
			required: true,
			choices: [
				{
					name: 'General',
					value: 'general',
				},
				{
					name: 'Moderation',
					value: 'moderation',
				},
				{
					name: 'Auto moderation',
					value: 'automod',
				},
				{
					name: 'Logging',
					value: 'logs',
				},
			],
		},
	],
} as interactionOptions;

