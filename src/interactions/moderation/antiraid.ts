import { ApplicationCommandOptionType } from 'discord.js';
import { MAX_REASON_LENGTH } from '../../constants';
import { interactionOptions } from '../../typings';

export const antiRaidCommand = {
	name: 'antiraid',
	description: 'Ban all the members with specfic information if there is a raid',
	directory: 'moderation',
	cooldown: 120000,
	permission: ['BanMembers'],
	options: [
		{
			name: 'registered',
			description: 'The account should be registered in the past <input> to be affected',
			type: ApplicationCommandOptionType.String,
			required: true,
			autocomplete: true,
		},
		{
			name: 'joined',
			description:
				'The user should have joined the server in the past <input> to be affected',
			type: ApplicationCommandOptionType.String,
			required: true,
			autocomplete: true,
		},
		{
			name: 'delete_messages',
			description: 'The amount of days to delete messages for',
			type: ApplicationCommandOptionType.Number,
			required: false,
			choices: [
				{ name: "Don't delete any", value: 0 },
				{ name: 'Previous 24 hours', value: 1 },
				{ name: 'Previous 48 hours', value: 2 },
				{ name: 'Previous 3 days', value: 3 },
				{ name: 'Previous 4 days', value: 4 },
				{ name: 'Previous 5 days', value: 5 },
				{ name: 'Previous 6 days', value: 6 },
				{ name: 'Previous 7 days', value: 7 },
			],
		},
		{
			name: 'reason',
			description: 'The reason of this action',
			type: ApplicationCommandOptionType.String,
			required: false,
			min_length: 1,
			max_length: MAX_REASON_LENGTH,
		},
	],
} as interactionOptions;

