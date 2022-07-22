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
			options: [
				{
					name: 'module',
					description: 'The moderation module you want to configure',
					type: ApplicationCommandOptionType.String,
					required: false,
					choices: [
						{
							name: 'Manual warnings count - first timeout',
							value: 'count_timeout1',
						},
						{
							name: 'Manual warnings count - second timeout',
							value: 'count_timeout2',
						},
						{ name: 'Manual warnings count - ban', value: 'count_ban' },
						{
							name: 'Automod timeout warnings multiplication',
							value: 'count_automod',
						},
						{ name: 'Manual first timeout duration', value: 'duration_timeout1' },
						{
							name: 'Manual second timeout duration',
							value: 'duration_timeout2',
						},
						{ name: 'Manual ban duration', value: 'duration_ban' },
						{ name: 'Automod timeout duration', value: 'duration_automod' },
						{ name: 'Default timeout duration', value: 'default_timeout' },
						{ name: 'Default softban duration', value: 'default_softban' },
						{ name: 'Default ban delete message days', value: 'default_msgs' },
					],
				},
				{
					name: 'value',
					description: 'The new value of this module',
					type: ApplicationCommandOptionType.String,
					required: false,
				},
			],
		},
	],
} as interactionOptions;

