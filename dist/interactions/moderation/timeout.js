"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeoutCommand = void 0;
const discord_js_1 = require("discord.js");
exports.timeoutCommand = {
    name: 'timeout',
    description: 'Times out a member in the server.',
    directory: 'moderation',
    cooldown: 3000,
    permission: ['ModerateMembers'],
    options: [
        {
            name: 'member',
            description: 'The member you wish to timeout.',
            type: discord_js_1.ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'duration',
            description: 'The duration of this timeout.',
            type: discord_js_1.ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: 'reason',
            description: 'The reason of this timeout.',
            type: discord_js_1.ApplicationCommandOptionType.String,
            required: false,
            autocomplete: true,
        },
    ],
};
