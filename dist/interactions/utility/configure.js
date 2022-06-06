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
        {
            name: 'general',
            description: 'Configure the general config and settings',
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'module',
                    description: 'The general module you want to configure',
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    required: false,
                    choices: [
                        { name: 'Owner ID', value: 'ownerId' },
                        { name: 'Add or remove a developer', value: 'developers' },
                        { name: 'Server ban appeal link', value: 'guild_appealLink' },
                        { name: 'Server member role id', value: 'guild_memberRoleId' },
                        {
                            name: 'Server modmail category id',
                            value: 'guild_modmailCategoryId',
                        },
                        { name: 'Success Emoji', value: 'success' },
                        { name: 'Attention Emoji', value: 'attention' },
                        { name: 'Error Emoji', value: 'error' },
                    ],
                },
                {
                    name: 'new-value',
                    description: 'The new value of this module, developer module adds or removes a single user',
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    required: false,
                },
            ],
        },
    ],
};
