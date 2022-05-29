"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modmailCommand = void 0;
const discord_js_1 = require("discord.js");
exports.modmailCommand = {
    name: 'modmail',
    description: 'Take an action on the modmail system',
    directory: 'modmail',
    permission: ['ManageMessages'],
    cooldown: 10000,
    options: [
        {
            name: 'close',
            description: 'Close the active ticket in this channel',
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
        },
        {
            name: 'open',
            description: "Open a modmail directly into a user's DMs",
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'user',
                    description: 'The user you want to open modmail for',
                    type: discord_js_1.ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: 'reason',
                    description: 'The reason of this creation',
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    required: false,
                },
            ],
        },
        {
            name: 'blacklist',
            description: 'Blacklist or unblacklist a user from creating tickets',
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'user',
                    description: 'The user you want to take action on',
                    type: discord_js_1.ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: 'reason',
                    description: 'The reason of this action',
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    required: false,
                },
            ],
        },
    ],
};
