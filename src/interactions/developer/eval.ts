import { ApplicationCommandOptionType } from 'discord.js';
import { interactionOptions } from '../../typings';

export const evalCommand = {
	name: 'eval',
	description: 'Eval a code directly into the bot',
	directory: 'developer',
	cooldown: 3000,
	permission: [],
	options: [
		{
			name: 'async',
			description: 'Make the eval an async function.',
			type: ApplicationCommandOptionType.Boolean,
			required: false,
		},
		{
			name: 'silent',
			description: 'Make the respond hidden from everyone.',
			type: ApplicationCommandOptionType.Boolean,
			required: false,
		},
	],
} as interactionOptions;
