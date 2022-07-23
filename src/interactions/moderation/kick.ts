import { ApplicationCommandOptionType } from 'discord.js';
import { MAX_REASON_LENGTH } from '../../constants';
import { interactionOptions } from '../../typings';

export const kickCommand = {
	name: 'kick',
	description: 'Kicks out a member from the server',
	directory: 'moderation',
	cooldown: 300,
	permission: ['KickMembers'],
	botPermission: ['KickMembers'],
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
			min_length: 1,
			max_length: MAX_REASON_LENGTH,
			autocomplete: true,
		},
	],
} as interactionOptions;
