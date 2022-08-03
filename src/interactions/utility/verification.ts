import { ApplicationCommandOptionType, ChannelType } from 'discord.js';
import { EMBED_DESCRIPTION_MAX_LENGTH } from '../../constants';
import { interactionOptions } from '../../typings';

export const verificationCommand = {
	name: 'verification',
	description: 'Setup the verification module',
	directory: 'utility',
	cooldown: 10000,
	permission: ['Administrator'],
	options: [
		{
			name: 'channel',
			description: 'The channel you want the verification message to be sent to',
			type: ApplicationCommandOptionType.Channel,
			channel_types: [ChannelType.GuildText],
			required: true,
		},
		{
			name: 'title',
			description: 'Set a title for the verification embed',
			type: ApplicationCommandOptionType.String,
			required: false,
			min_length: 1,
			max_length: 256,
		},
		{
			name: 'description',
			description: 'Describe what is verification used for, to let everyone know',
			type: ApplicationCommandOptionType.String,
			required: false,
			min_length: 1,
			max_length: EMBED_DESCRIPTION_MAX_LENGTH,
		},
		{
			name: 'image',
			description: 'Add an image to the verification embed',
			type: ApplicationCommandOptionType.Attachment,
			required: false,
		},
	],
} as interactionOptions;

