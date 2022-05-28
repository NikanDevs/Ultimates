import { ApplicationCommandOptionType } from 'discord.js';
import { interactionOptions } from '../../typings/Command';

export const punishmentCommand = {
	name: 'punishment',
	description: 'Punishment command subcommands.',
	directory: 'moderation',
	cooldown: 3000,
	permission: ['ManageMessages'],
	options: [
		{
			name: 'revoke',
			description: 'Revokes a punishment.',
			type: ApplicationCommandOptionType['Subcommand'],
			options: [
				{
					name: 'id',
					description: 'The Id of the punishment you wish to revoke.',
					required: true,
					type: ApplicationCommandOptionType.String,
					autocomplete: true,
				},
				{
					name: 'reason',
					description: "The reason that you're revoking",
					required: false,
					type: ApplicationCommandOptionType.String,
				},
			],
		},
		{
			name: 'search',
			description: 'Search for a punishment.',
			type: ApplicationCommandOptionType['Subcommand'],
			options: [
				{
					name: 'id',
					description: 'The Id of the punishment you wish to find.',
					required: true,
					type: ApplicationCommandOptionType.String,
					autocomplete: true,
				},
			],
		},
		{
			name: 'view',
			description: 'View all the punishments recorded for a user.',
			type: ApplicationCommandOptionType['Subcommand'],
			options: [
				{
					name: 'user',
					description: 'The user you want to view their punishments.',
					required: true,
					type: ApplicationCommandOptionType.User,
				},
			],
		},
		{
			name: 'update',
			description: 'Update a punishment',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'id',
					description: 'The id of the punishment you want to update.',
					required: true,
					type: ApplicationCommandOptionType.String,
					autocomplete: true,
				},
				{
					name: 'value',
					description: 'Select what part of the punishment you want to update.',
					required: true,
					type: ApplicationCommandOptionType.Number,
					choices: [
						{
							name: 'duration',
							value: 1,
						},
						{
							name: 'reason',
							value: 2,
						},
					],
				},
				{
					name: 'new-value',
					description: 'The value you want this punishment to be updated to.',
					required: true,
					type: ApplicationCommandOptionType.String,
				},
			],
		},
	],
} as interactionOptions;

