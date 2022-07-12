import { ApplicationCommandOptionType } from 'discord.js';
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
			name: 'update',
			description: 'Update the duration or reason for a punishment',
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
					name: 'value',
					description: 'The part of the punishment you want to update',
					required: true,
					type: ApplicationCommandOptionType.Number,
					choices: [
						{
							name: 'reason',
							value: 1,
						},
					],
				},
				{
					name: 'new-value',
					description: 'The new value you want to set for the punishment',
					required: true,
					type: ApplicationCommandOptionType.String,
				},
			],
		},
	],
} as interactionOptions;

