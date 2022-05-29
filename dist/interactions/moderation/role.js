"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleCommand = void 0;
const discord_js_1 = require("discord.js");
exports.roleCommand = {
    name: 'role',
    description: "Take an action on a member's roles",
    directory: 'moderation',
    cooldown: 3000,
    permission: ['ManageRoles'],
    options: [
        {
            name: 'edit',
            description: 'Add or remove a role based on its current status',
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'member',
                    description: 'The member you want to take action on',
                    type: discord_js_1.ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: 'role',
                    description: 'The role you want to add or remove',
                    type: discord_js_1.ApplicationCommandOptionType.Role,
                    required: true,
                },
            ],
        },
    ],
};
