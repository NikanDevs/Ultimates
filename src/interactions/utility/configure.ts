import { ApplicationCommandOptionType } from 'discord.js';
import { interactionOptions } from '../../typings';

export const configureCommand = {
	name: 'configure',
	description: 'Configure different modules of the bot',
	directory: 'utility',
	cooldown: 5000,
	permission: ['Administrator'],
	options: [
		{
			name: 'logs',
			description: 'Configure the settings of the logging system',
			type: ApplicationCommandOptionType.Subcommand,
		},
		{
			name: 'automod',
			description: 'Configure the settings of the auto moderation system',
			type: ApplicationCommandOptionType.Subcommand,
		},
		{
			name: 'general',
			description: 'Configure the general config and settings',
			type: ApplicationCommandOptionType.Subcommand,
		},
		{
			name: 'moderation',
			description: 'Configure the settings of the moderation module',
			type: ApplicationCommandOptionType.Subcommand,
		},
	],
} as interactionOptions;

