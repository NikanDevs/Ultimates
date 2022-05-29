"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unbanCommand = void 0;
const discord_js_1 = require("discord.js");
exports.unbanCommand = {
    name: 'unban',
    description: 'Unban a user which is currently banned',
    directory: 'moderation',
    cooldown: 3000,
    permission: ['BanMembers'],
    options: [
        {
            name: 'user',
            description: 'The user you want to unban',
            type: discord_js_1.ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
        },
        {
            name: 'reason',
            description: 'The reason of this unban',
            type: discord_js_1.ApplicationCommandOptionType.String,
            required: false,
            autocomplete: true,
        },
    ],
};
