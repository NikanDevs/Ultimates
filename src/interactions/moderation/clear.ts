import { ApplicationCommandOptionType } from 'discord.js';
import { interactionOptions } from '../../typings';

export const clearCommand = {
	name: 'clear',
	description: 'Clear out messages from this channel',
	directory: 'moderation',
	cooldown: 5000,
	permission: ['ManageMessages'],
	botPermission: ['ManageMessages'],
	options: [
		{
			name: 'amount',
			description: 'The number of messages you want to clear',
			type: ApplicationCommandOptionType.Number,
			required: true,
			min_value: 2,
			max_value: 100,
		},
		{
			name: 'user',
			description: 'Clear out the messages sent by a specfic user',
			type: ApplicationCommandOptionType.User,
			required: false,
		},
	],
} as interactionOptions;
