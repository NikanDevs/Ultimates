import { ApplicationCommandOptionType } from 'discord.js';
import { MAX_REASON_LENGTH } from '../../constants';
import { deleteDayRewites, interactionOptions } from '../../typings';

export const banCommand = {
	name: 'ban',
	description: 'Bans a user and they will be not able to join this server anymore',
	directory: 'moderation',
	cooldown: 3000,
	permission: ['BanMembers'],
	botPermission: ['BanMembers'],
	options: [
		{
			name: 'user',
			description: 'The user you want to ban',
			type: ApplicationCommandOptionType.User,
			required: true,
		},
		{
			name: 'delete_messages',
			description: 'The amount of days to delete messages for',
			type: ApplicationCommandOptionType.Number,
			required: false,
			choices: [
				{ name: deleteDayRewites[0], value: 0 },
				{ name: deleteDayRewites[1], value: 1 },
				{ name: deleteDayRewites[2], value: 2 },
				{ name: deleteDayRewites[3], value: 3 },
				{ name: deleteDayRewites[4], value: 4 },
				{ name: deleteDayRewites[5], value: 5 },
				{ name: deleteDayRewites[6], value: 6 },
				{ name: deleteDayRewites[7], value: 7 },
			],
		},
		{
			name: 'reason',
			description: 'The reason of this action',
			type: ApplicationCommandOptionType.String,
			required: false,
			min_length: 1,
			max_length: MAX_REASON_LENGTH,
			autocomplete: true,
		},
	],
} as interactionOptions;
