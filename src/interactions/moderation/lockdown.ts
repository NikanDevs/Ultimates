import { ApplicationCommandOptionType, ChannelType } from 'discord.js';

export const lockdownCommand = {
	name: 'lockdown',
	description: 'Lockdown sub command.',
	directory: 'moderation',
	cooldown: 20000,
	permission: ['ManageMessages'],
	options: [
		{
			name: 'channel',
			description: 'Locks or unlocks a channel based on its current status.',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'channel',
					description: 'The channel you wish to take action on.',
					type: ApplicationCommandOptionType.Channel,
					required: false,
					channel_types: [
						ChannelType.GuildText,
						ChannelType.GuildVoice,
						ChannelType.GuildStageVoice,
					],
				},
				{
					name: 'reason',
					description: 'The reason of this action.',
					type: ApplicationCommandOptionType.String,
					required: false,
				},
			],
		},
		{
			name: 'server',
			description: 'Locks or unlocks the server based on its current status.',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'reason',
					description: 'The reason of this action.',
					type: ApplicationCommandOptionType.String,
					required: false,
				},
			],
		},
	],
} as const;

