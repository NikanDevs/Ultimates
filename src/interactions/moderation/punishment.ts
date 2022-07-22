import { ApplicationCommandOptionType } from 'discord.js';
import { MAX_REASON_LENGTH } from '../../constants';
import { interactionOptions } from '../../typings';

export const punishmentCommand = {
	name: 'punishment',
	description: 'Take an action on an existing punishment',
	directory: 'moderation',
	cooldown: 3000,
	permission: ['ManageMessages'],
	options: [
		{
			name: 'revoke',
			description: 'Revoke a punishment whether can be active or not',
			type: ApplicationCommandOptionType['Subcommand'],
			options: [
				{
					name: 'id',
					description: 'The id of the punishment',
					required: true,
					type: ApplicationCommandOptionType.String,
					autocomplete: true,
				},
				{
					name: 'reason',
					description: 'The reason of this action',
					required: false,
					type: ApplicationCommandOptionType.String,
				},
			],
		},
		{
			name: 'search',
			description: 'Search for an existing punishment',
			type: ApplicationCommandOptionType['Subcommand'],
			options: [
				{
					name: 'id',
					description: 'The id of the punishment',
					required: true,
					type: ApplicationCommandOptionType.String,
					autocomplete: true,
				},
			],
		},
		{
			name: 'view',
			description: 'View all the recorded punishments for a user',
			type: ApplicationCommandOptionType['Subcommand'],
			options: [
				{
					name: 'user',
					description: 'The user you want to view punishments for',
					required: true,
					type: ApplicationCommandOptionType.User,
				},
			],
		},
		{
			name: 'reason',
			description: 'Change the reason for a punishment',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'id',
					description: 'The id of the punishment',
					required: true,
					type: ApplicationCommandOptionType.String,
					autocomplete: true,
				},
				{
					name: 'reason',
					description: 'The new reason you want to set for this punishment',
					required: true,
					type: ApplicationCommandOptionType.String,
					min_length: 1,
					max_length: MAX_REASON_LENGTH,
				},
			],
		},
	],
} as interactionOptions;
