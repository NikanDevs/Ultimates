import { ApplicationCommandOptionType, ChannelType } from 'discord.js';

export const configureCommand = {
	name: 'configure',
	description: 'Configure different modules of the bot.',
	directory: 'utility',
	cooldown: 5000,
	permission: ['Administrator'],
	options: [
		{
			name: 'logs',
			description: 'Configure the settings of the logging system.',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'module',
					description: 'The log module you want to configure.',
					type: ApplicationCommandOptionType.String,
					required: false,
					choices: [
						{ name: 'Moderation', value: 'mod' },
						{ name: 'Message', value: 'message' },
						{ name: 'Modmail', value: 'modmail' },
						{ name: 'Joins & Leaves', value: 'servergate' },
					],
				},
				{
					name: 'channel',
					description: 'The channel you want the module to be posting on.',
					type: ApplicationCommandOptionType.Channel,
					channel_types: [ChannelType.GuildText],
					required: false,
				},
				{
					name: 'active',
					description: 'The channel you want the module to be active on.',
					type: ApplicationCommandOptionType.Boolean,
					required: false,
				},
			],
		},
	],
} as const;

