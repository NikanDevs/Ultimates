import { ApplicationCommandOptionType } from 'discord.js';
import { interactionOptions } from '../../typings';

export const kickCommand = {
	name: 'kick',
	description: 'Kicks out a member from the server',
	directory: 'moderation',
	cooldown: 300,
	permission: ['KickMembers'],
	options: [
		{
			name: 'member',
			description: 'The member you want to kick from the server',
			type: ApplicationCommandOptionType.User,
			required: true,
		},
		{
			name: 'reason',
			description: 'The reason of this action',
			type: ApplicationCommandOptionType.String,
			required: false,
			autocomplete: true,
		},
	],
} as interactionOptions;

