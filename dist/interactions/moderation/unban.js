"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unbanCommand = void 0;
const discord_js_1 = require("discord.js");
exports.unbanCommand = {
    name: 'unban',
    description: 'Unbans a user that was previously banned.',
    directory: 'moderation',
    cooldown: 3000,
    permission: ['BanMembers'],
    options: [
        {
            name: 'user-id',
            description: 'The user you wish to unban.',
            type: discord_js_1.ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
        },
        {
            name: 'reason',
            description: 'The reason of the unban.',
            type: discord_js_1.ApplicationCommandOptionType.String,
            required: false,
            autocomplete: true,
        },
    ],
};
