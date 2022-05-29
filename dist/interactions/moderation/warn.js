"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warnCommand = void 0;
const discord_js_1 = require("discord.js");
exports.warnCommand = {
    name: 'warn',
    description: 'Warn a member',
    directory: 'moderation',
    cooldown: 3000,
    permission: ['ManageMessages'],
    options: [
        {
            name: 'member',
            description: 'The member you want to warn',
            type: discord_js_1.ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'reason',
            description: 'The reason for this warning',
            type: discord_js_1.ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
        },
    ],
};
