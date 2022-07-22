import { ApplicationCommandOptionType, ChannelType } from 'discord.js';
import { interactionOptions } from '../../typings';

export const configureCommand = {
	name: 'configure',
	description: 'Configure different modules of the bot',
	directory: 'utility',
	cooldown: 5000,
	permission: ['Administrator'],
	options: [
		{
			name: 'logs',
			description: 'Configure the settings of the logging system',
			type: ApplicationCommandOptionType.Subcommand,
		},
		{
			name: 'automod',
			description: 'Configure the settings of the auto moderation system',
			type: ApplicationCommandOptionType.Subcommand,
		},
		{
			name: 'general',
			description: 'Configure the general config and settings',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'module',
					description: 'The general module you want to configure',
					type: ApplicationCommandOptionType.String,
					required: false,
					choices: [
						{ name: 'Owner ID', value: 'ownerId' },
						{ name: 'Add or remove a developer', value: 'developers' },
						{ name: 'Server ban appeal link', value: 'guild_appealLink' },
						{ name: 'Server member role id', value: 'guild_memberRoleId' },
						{
							name: 'Server modmail category id',
							value: 'guild_modmailCategoryId',
						},
					],
				},
				{
					name: 'value',
					description:
						'The value of this module (developers module will remove if you enter an existing id)',
					type: ApplicationCommandOptionType.String,
					required: false,
				},
			],
		},
		{
			name: 'moderation',
			description: 'Configure the settings of the moderation module',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'module',
					description: 'The moderation module you want to configure',
					type: ApplicationCommandOptionType.String,
					required: false,
					choices: [
						{
							name: 'Manual warnings count - first timeout',
							value: 'count_timeout1',
						},
						{
							name: 'Manual warnings count - second timeout',
							value: 'count_timeout2',
						},
						{ name: 'Manual warnings count - ban', value: 'count_ban' },
						{
							name: 'Automod timeout warnings multiplication',
							value: 'count_automod',
						},
						{ name: 'Manual first timeout duration', value: 'duration_timeout1' },
						{
							name: 'Manual second timeout duration',
							value: 'duration_timeout2',
						},
						{ name: 'Manual ban duration', value: 'duration_ban' },
						{ name: 'Automod timeout duration', value: 'duration_automod' },
						{ name: 'Default timeout duration', value: 'default_timeout' },
						{ name: 'Default softban duration', value: 'default_softban' },
						{ name: 'Default ban delete message days', value: 'default_msgs' },
					],
				},
				{
					name: 'value',
					description: 'The new value of this module',
					type: ApplicationCommandOptionType.String,
					required: false,
				},
			],
		},
		{
			name: 'ignores',
			description: 'Configure the ignore values for diffrent modules',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'module',
					description: 'The module you want to configure ignores for',
					type: ApplicationCommandOptionType.String,
					required: false,
					choices: [
						{ name: 'Automod: Filtered words', value: 'automod:badwords' },
						{ name: 'Automod: Discord invites', value: 'automod:invites' },
						{ name: 'Automod: Large messages', value: 'automod:largeMessage' },
						{ name: 'Automod: Mass mentions', value: 'automod:massMention' },
						{ name: 'Automod: Mass emoji', value: 'automod:massEmoji' },
						{ name: 'Automod: Spam', value: 'automod:spam' },
						{ name: 'Automod: Too many capitals', value: 'automod:capitals' },
						{ name: 'Automod: Urls and links', value: 'automod:urls' },
						{ name: 'Logging: Message logs', value: 'logs:message' },
						{ name: 'Logging: Voice logs', value: 'logs:voice' },
					],
				},
				{
					name: 'channel',
					description: 'Add or remove a channel to/from the ignore list',
					type: ApplicationCommandOptionType.Channel,
					required: false,
					channel_types: [ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildNews],
				},
				{
					name: 'role',
					description: 'Add or remove a role to/from the ignore list.',
					type: ApplicationCommandOptionType.Role,
					required: false,
				},
			],
		},
	],
} as interactionOptions;

