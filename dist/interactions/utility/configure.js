"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureCommand = void 0;
const discord_js_1 = require("discord.js");
exports.configureCommand = {
    name: 'configure',
    description: 'Configure different modules of the bot',
    directory: 'utility',
    cooldown: 5000,
    permission: ['Administrator'],
    options: [
        {
            name: 'logs',
            description: 'Configure the settings of the logging system',
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'module',
                    description: 'The log module you want to configure',
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    required: false,
                    choices: [
                        { name: 'Moderation', value: 'mod' },
                        { name: 'Message', value: 'message' },
                        { name: 'Modmail', value: 'modmail' },
                        { name: 'Joins & Leaves', value: 'servergate' },
                    ],
                },
                {
                    name: 'channel',
                    description: 'The channel you want the module to be posting on',
                    type: discord_js_1.ApplicationCommandOptionType.Channel,
                    channel_types: [discord_js_1.ChannelType.GuildText],
                    required: false,
                },
                {
                    name: 'active',
                    description: 'If this module should be active at the time and post',
                    type: discord_js_1.ApplicationCommandOptionType.Boolean,
                    required: false,
                },
            ],
        },
        {
            name: 'automod',
            description: 'Configure the settings of the auto moderation system',
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'module',
                    description: 'The automod module you want to configure',
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    required: false,
                    choices: [
                        { name: 'Filtered Words', value: 'badwords' },
                        { name: 'Discord Invites', value: 'invites' },
                        { name: 'Large Messages', value: 'largeMessage' },
                        { name: 'Mass Mentions', value: 'massMention' },
                        { name: 'Mass Emojis', value: 'massEmoji' },
                        { name: 'Spam', value: 'spam' },
                        { name: 'capitals', value: 'capitals' },
                        { name: 'Urls & Links', value: 'urls' },
                    ],
                },
                {
                    name: 'active',
                    description: 'If this module should be active at the time',
                    type: discord_js_1.ApplicationCommandOptionType.Boolean,
                    required: false,
                },
            ],
        },
    ],
};
