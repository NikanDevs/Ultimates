import { ApplicationCommandOptionType } from 'discord.js';
import { interactionOptions } from '../../typings';

export const warningsCommand = {
	name: 'warnings',
	description: 'View your active punishments in this server',
	directory: 'moderation',
	cooldown: 5000,
	permission: [],
	botPermission: [],
	options: [
		{
			name: 'type',
			description: 'Filter the warnings being shown',
			type: ApplicationCommandOptionType.Number,
			required: false,
			choices: [
				{
					name: 'Manual warnings',
					value: 1,
				},
				{
					name: 'Auto moderation warnings',
					value: 2,
				},
			],
		},
	],
} as interactionOptions;
