"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slowmodeCommand = void 0;
const discord_js_1 = require("discord.js");
exports.slowmodeCommand = {
    name: 'slowmode',
    description: 'Set the slowmode for this channel',
    directory: 'moderation',
    cooldown: 3000,
    permission: ['ManageMessages'],
    options: [
        {
            name: 'rate',
            description: 'The rate you want to set the slowmode to, in seconds',
            type: discord_js_1.ApplicationCommandOptionType.Integer,
            required: false,
            min_value: 0,
            max_value: 21600,
        },
    ],
};
