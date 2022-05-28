import { ApplicationCommandOptionType } from 'discord.js';
import { interactionOptions } from '../../typings/Command';

export const nicknameCommand = {
	name: 'nickname',
	description: "Changes, moderates or reset a member's nickname.",
	directory: 'moderation',
	cooldown: 3000,
	permission: ['ManageNicknames'],
	options: [
		{
			name: 'member',
			description: 'The member you wish to edit their nickname.',
			type: ApplicationCommandOptionType.User,
			required: true,
		},
		{
			name: 'nickname',
			description: 'The new nickname you wish to set for the member.',
			type: ApplicationCommandOptionType.User,
			required: false,
		},
	],
} as interactionOptions;

