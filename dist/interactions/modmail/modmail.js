"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modmailCommand = void 0;
const discord_js_1 = require("discord.js");
exports.modmailCommand = {
    name: 'modmail',
    description: 'Actions on modmail.',
    directory: 'modmail',
    permission: ['ManageMessages'],
    cooldown: 10000,
    options: [
        {
            name: 'close',
            description: 'Closes the ticket in the current channel.',
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
        },
        {
            name: 'open',
            description: "Open a modmail directly into a user's DMs.",
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'user',
                    description: 'The user you wish to open modmail for.',
                    type: discord_js_1.ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: 'reason',
                    description: "The reason that you're creating this thread.",
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    required: false,
                },
            ],
        },
        {
            name: 'blacklist',
            description: 'Blacklists/Unblacklists a user from the modmail.',
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'user',
                    description: 'The user you wish to take action on.',
                    type: discord_js_1.ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: 'reason',
                    description: 'The reason of the action.',
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    required: false,
                },
            ],
        },
    ],
};
