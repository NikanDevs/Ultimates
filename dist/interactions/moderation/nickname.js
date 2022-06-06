"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nicknameCommand = void 0;
const discord_js_1 = require("discord.js");
exports.nicknameCommand = {
    name: 'nickname',
    description: "Change, moderate or reset a member's nickname",
    directory: 'moderation',
    cooldown: 3000,
    permission: ['ManageNicknames'],
    options: [
        {
            name: 'member',
            description: 'The member you want to take action on',
            type: discord_js_1.ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'nickname',
            description: 'The new nickname you want to set for the member',
            type: discord_js_1.ApplicationCommandOptionType.String,
            required: false,
        },
    ],
};
