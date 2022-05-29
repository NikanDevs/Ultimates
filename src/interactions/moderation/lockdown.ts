import { ApplicationCommandOptionType, ChannelType } from 'discord.js';
import { interactionOptions } from '../../typings/Command';

export const lockdownCommand = {
	name: 'lockdown',
	description: 'Lock the server or a specific channel down',
	directory: 'moderation',
	cooldown: 20000,
	permission: ['ManageMessages'],
	options: [
		{
			name: 'channel',
			description: 'Lock or unlock a channel based on its current status',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'channel',
					description: 'The channel you want to take action on',
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
					description: 'The reason of this action',
					type: ApplicationCommandOptionType.String,
					required: false,
				},
			],
		},
		{
			name: 'server',
			description: 'Lock or unlock the server based on its current status',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'reason',
					description: 'The reason of this action',
					type: ApplicationCommandOptionType.String,
					required: false,
				},
			],
		},
	],
} as interactionOptions;
