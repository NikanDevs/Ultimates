"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureCommand = void 0;
const discord_js_1 = require("discord.js");
exports.configureCommand = {
    name: 'configure',
    description: 'Configure different modules of the bot.',
    directory: 'utility',
    cooldown: 5000,
    permission: ['Administrator'],
    options: [
        {
            name: 'logs',
            description: 'Configure the settings of the logging system.',
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'module',
                    description: 'The log module you want to configure.',
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
                    description: 'The channel you want the module to be posting on.',
                    type: discord_js_1.ApplicationCommandOptionType.Channel,
                    channel_types: [discord_js_1.ChannelType.GuildText],
                    required: false,
                },
                {
                    name: 'active',
                    description: 'The channel you want the module to be active on.',
                    type: discord_js_1.ApplicationCommandOptionType.Boolean,
                    required: false,
                },
            ],
        },
    ],
};
