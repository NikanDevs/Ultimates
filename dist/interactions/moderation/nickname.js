"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nicknameCommand = void 0;
const discord_js_1 = require("discord.js");
exports.nicknameCommand = {
    name: 'nickname',
    description: "Changes, moderates or reset a member's nickname.",
    directory: 'moderation',
    cooldown: 3000,
    permission: ['ManageNicknames'],
    options: [
        {
            name: 'member',
            description: 'The member you wish to edit their nickname.',
            type: discord_js_1.ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'nickname',
            description: 'The new nickname you wish to set for the member.',
            type: discord_js_1.ApplicationCommandOptionType.User,
            required: false,
        },
    ],
};
