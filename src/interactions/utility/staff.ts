import { ApplicationCommandOptionType } from 'discord.js';
import { interactionOptions } from '../../typings';

export const staffCommand = {
	name: 'staff',
	description: 'Displays a list of available staff members',
	directory: 'utility',
	cooldown: 5000,
	permission: [],
	options: [
		{
			name: 'hidden',
			description: 'Makes the reply to this command hidden to everyone.',
			type: ApplicationCommandOptionType.Boolean,
			required: false,
		},
	],
} as interactionOptions;
