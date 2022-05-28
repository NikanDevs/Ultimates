import { ApplicationCommandOptionType } from 'discord.js';
import { interactionOptions } from '../../typings/Command';

export const warningsCommand = {
	name: 'warnings',
	description: 'View your active punishments in the server.',
	directory: 'moderation',
	cooldown: 5000,
	permission: [],
	available: true,
	options: [
		{
			name: 'type',
			description: 'Choose if you want to view your automod or manual warnings.',
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

