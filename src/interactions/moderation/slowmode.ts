import { ApplicationCommandOptionType } from 'discord.js';
import { interactionOptions } from '../../typings';

export const slowmodeCommand = {
	name: 'slowmode',
	description: 'Set the slowmode for this channel',
	directory: 'moderation',
	cooldown: 3000,
	permission: ['ManageMessages'],
	options: [
		{
			name: 'rate',
			description: 'The rate you want to set the slowmode to, in seconds',
			type: ApplicationCommandOptionType.Integer,
			required: false,
			min_value: 0,
			max_value: 21600,
		},
	],
} as interactionOptions;

