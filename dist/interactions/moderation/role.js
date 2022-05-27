"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleCommand = void 0;
const discord_js_1 = require("discord.js");
exports.roleCommand = {
    name: 'role',
    description: 'Role subcommand.',
    directory: 'moderation',
    cooldown: 3000,
    permission: ['ManageRoles'],
    options: [
        {
            name: 'edit',
            description: 'Adds or removes a role based on its current status.',
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'member',
                    description: 'The member you wish to take action on.',
                    type: discord_js_1.ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: 'role',
                    description: 'The role you wish to add or remove.',
                    type: discord_js_1.ApplicationCommandOptionType.Role,
                    required: true,
                },
            ],
        },
    ],
};
