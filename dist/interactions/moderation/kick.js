"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kickCommand = void 0;
const discord_js_1 = require("discord.js");
exports.kickCommand = {
    name: 'kick',
    description: 'Kicks out a member from the server',
    directory: 'moderation',
    cooldown: 300,
    permission: ['KickMembers'],
    options: [
        {
            name: 'member',
            description: 'The member you want to kick from the server',
            type: discord_js_1.ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'reason',
            description: 'The reason of this action',
            type: discord_js_1.ApplicationCommandOptionType.String,
            required: false,
            autocomplete: true,
        },
    ],
};
