"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.punishmentCommand = void 0;
const discord_js_1 = require("discord.js");
exports.punishmentCommand = {
    name: 'punishment',
    description: 'Take an action on an existing punishment',
    directory: 'moderation',
    cooldown: 3000,
    permission: ['ManageMessages'],
    options: [
        {
            name: 'revoke',
            description: 'Revoke a punishment whether can be active or not',
            type: discord_js_1.ApplicationCommandOptionType['Subcommand'],
            options: [
                {
                    name: 'id',
                    description: 'The id of the punishment',
                    required: true,
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    autocomplete: true,
                },
                {
                    name: 'reason',
                    description: 'The reason of this action',
                    required: false,
                    type: discord_js_1.ApplicationCommandOptionType.String,
                },
            ],
        },
        {
            name: 'search',
            description: 'Search for an existing punishment',
            type: discord_js_1.ApplicationCommandOptionType['Subcommand'],
            options: [
                {
                    name: 'id',
                    description: 'The id of the punishment',
                    required: true,
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    autocomplete: true,
                },
            ],
        },
        {
            name: 'view',
            description: 'View all the recorded punishments for a user',
            type: discord_js_1.ApplicationCommandOptionType['Subcommand'],
            options: [
                {
                    name: 'user',
                    description: 'The user you want to view punishments for',
                    required: true,
                    type: discord_js_1.ApplicationCommandOptionType.User,
                },
            ],
        },
        {
            name: 'update',
            description: 'Update the duration or reason for a punishment',
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'id',
                    description: 'The id of the punishment',
                    required: true,
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    autocomplete: true,
                },
                {
                    name: 'value',
                    description: 'The part of the punishment you want to update',
                    required: true,
                    type: discord_js_1.ApplicationCommandOptionType.Number,
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
                    description: 'The new value you want to set for the punishment',
                    required: true,
                    type: discord_js_1.ApplicationCommandOptionType.String,
                },
            ],
        },
    ],
};
