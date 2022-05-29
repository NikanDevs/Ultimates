"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purgeCommand = void 0;
const discord_js_1 = require("discord.js");
exports.purgeCommand = {
    name: 'purge',
    description: 'Clear out messages from this channel',
    directory: 'moderation',
    cooldown: 5000,
    permission: ['ManageMessages'],
    options: [
        {
            name: 'amount',
            description: 'The number of messages you want to clear',
            type: discord_js_1.ApplicationCommandOptionType.Number,
            required: true,
            min_value: 2,
            max_value: 100,
        },
        {
            name: 'user',
            description: 'Clear out the messages sent by a specfic user',
            type: discord_js_1.ApplicationCommandOptionType.User,
            required: false,
        },
    ],
};
