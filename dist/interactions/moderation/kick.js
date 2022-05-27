"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kickCommand = void 0;
const discord_js_1 = require("discord.js");
exports.kickCommand = {
    name: 'kick',
    description: 'Kicks a member from the server.',
    directory: 'moderation',
    cooldown: 300,
    permission: ['KickMembers'],
    options: [
        {
            name: 'member',
            description: 'The member you wish to kick.',
            type: discord_js_1.ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'reason',
            description: 'The reason of this kick.',
            type: discord_js_1.ApplicationCommandOptionType.String,
            required: false,
            autocomplete: true,
        },
    ],
};
