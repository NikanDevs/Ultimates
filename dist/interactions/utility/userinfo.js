"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userinfoCommand = void 0;
const discord_js_1 = require("discord.js");
exports.userinfoCommand = {
    name: 'userinfo',
    description: 'Shows information for a user',
    directory: 'utility',
    cooldown: 3000,
    permission: ['ManageMessages'],
    options: [
        {
            name: 'user',
            description: 'The user you want to see information for',
            type: discord_js_1.ApplicationCommandOptionType.User,
            required: false,
        },
    ],
};
