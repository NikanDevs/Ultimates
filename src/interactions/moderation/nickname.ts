import { ApplicationCommandOptionType } from 'discord.js';
import { interactionOptions } from '../../typings/Command';

export const nicknameCommand = {
	name: 'nickname',
	description: "Change, moderate or reset a member's nickname",
	directory: 'moderation',
	cooldown: 3000,
	permission: ['ManageNicknames'],
	options: [
		{
			name: 'member',
			description: 'The member you want to take action on',
			type: ApplicationCommandOptionType.User,
			required: true,
		},
		{
			name: 'nickname',
			description: 'The new nickname you want to set for the member',
			type: ApplicationCommandOptionType.User,
			required: false,
		},
	],
} as interactionOptions;

