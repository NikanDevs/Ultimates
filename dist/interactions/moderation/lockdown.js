"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lockdownCommand = void 0;
const discord_js_1 = require("discord.js");
exports.lockdownCommand = {
    name: 'lockdown',
    description: 'Lockdown sub command.',
    directory: 'moderation',
    cooldown: 20000,
    permission: ['ManageMessages'],
    options: [
        {
            name: 'channel',
            description: 'Locks or unlocks a channel based on its current status.',
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'channel',
                    description: 'The channel you wish to take action on.',
                    type: discord_js_1.ApplicationCommandOptionType.Channel,
                    required: false,
                    channel_types: [
                        discord_js_1.ChannelType.GuildText,
                        discord_js_1.ChannelType.GuildVoice,
                        discord_js_1.ChannelType.GuildStageVoice,
                    ],
                },
                {
                    name: 'reason',
                    description: 'The reason of this action.',
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    required: false,
                },
            ],
        },
        {
            name: 'server',
            description: 'Locks or unlocks the server based on its current status.',
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'reason',
                    description: 'The reason of this action.',
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    required: false,
                },
            ],
        },
    ],
};
