"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purgeCommand = void 0;
const discord_js_1 = require("discord.js");
exports.purgeCommand = {
    name: 'purge',
    description: 'Clears out messages from the current channel.',
    directory: 'moderation',
    cooldown: 5000,
    permission: ['ManageMessages'],
    options: [
        {
            name: 'amount',
            description: 'The number of messages you wish to clear.',
            type: discord_js_1.ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'user',
            description: 'Clears out the messages from a user only.',
            type: discord_js_1.ApplicationCommandOptionType.User,
            required: false,
        },
    ],
};
