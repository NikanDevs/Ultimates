import { ApplicationCommandOptionType } from 'discord.js';

export const modmailCommand = {
	name: 'modmail',
	description: 'Actions on modmail.',
	directory: 'modmail',
	permission: ['ManageMessages'],
	cooldown: 10000,
	options: [
		{
			name: 'close',
			description: 'Closes the ticket in the current channel.',
			type: ApplicationCommandOptionType.Subcommand,
		},
		{
			name: 'open',
			description: "Open a modmail directly into a user's DMs.",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'user',
					description: 'The user you wish to open modmail for.',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: 'reason',
					description: "The reason that you're creating this thread.",
					type: ApplicationCommandOptionType.String,
					required: false,
				},
			],
		},
		{
			name: 'blacklist',
			description: 'Blacklists/Unblacklists a user from the modmail.',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'user',
					description: 'The user you wish to take action on.',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: 'reason',
					description: 'The reason of the action.',
					type: ApplicationCommandOptionType.String,
					required: false,
				},
			],
		},
	],
} as const;

