import { ApplicationCommandOptionType } from 'discord.js';
import { MAX_REASON_LENGTH } from '../../constants';
import { interactionOptions } from '../../typings';

export const modmailCommand = {
	name: 'modmail',
	description: 'Take an action on the modmail system',
	directory: 'modmail',
	permission: ['ManageMessages'],
	cooldown: 10000,
	options: [
		{
			name: 'close',
			description: 'Close the active ticket in this channel',
			type: ApplicationCommandOptionType.Subcommand,
		},
		{
			name: 'open',
			description: "Open a modmail directly into a user's DMs",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'user',
					description: 'The user you want to open modmail for',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: 'reason',
					description: 'The reason of this creation',
					type: ApplicationCommandOptionType.String,
					required: false,
					min_length: 1,
					max_length: MAX_REASON_LENGTH,
				},
			],
		},
		{
			name: 'blacklist',
			description: 'Blacklist or unblacklist a user from creating tickets',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'user',
					description: 'The user you want to take action on',
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
				},
			],
		},
	],
} as interactionOptions;
