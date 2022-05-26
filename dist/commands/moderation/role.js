"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const getsIgnored_1 = require("../../functions/getsIgnored");
const Command_1 = require("../../structures/Command");
exports.default = new Command_1.Command({
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
    excute: async ({ client, interaction, options }) => {
        const getSubCommand = options.getSubcommand();
        if (getSubCommand === 'edit') {
            const member = options.getMember('member');
            const role = options.getRole('role');
            var alreadyHas = false;
            if ((0, getsIgnored_1.getsIgnored)(interaction, member))
                return;
            if (role.position > interaction.guild.me.roles.highest.position || role.managed)
                return interaction.reply({
                    embeds: [
                        client.embeds.error("I don't have enough permissions to manage that role."),
                    ],
                    ephemeral: true,
                });
            if (member.roles.cache.has(role.id))
                alreadyHas = true;
            if ([
                'ManageMessages',
                'ModerateMembers',
                'BanMembers',
                'KickMembers',
                'ManageGuild',
                'ManageChannels',
                'Administrator',
            ].some((permission) => role.permissions.has(permission)))
                return interaction.reply({
                    embeds: [
                        client.embeds.error(`Woah! That role has some moderation powers, try ${alreadyHas ? 'removing' : 'adding'} them yourself.`),
                    ],
                    ephemeral: true,
                });
            switch (alreadyHas) {
                case false:
                    await member.roles.add(role);
                    await interaction.reply({
                        embeds: [
                            client.embeds.success(`${member} was added the role ${role}`),
                        ],
                    });
                    break;
                case true:
                    await member.roles.remove(role);
                    await interaction.reply({
                        embeds: [
                            client.embeds.success(`${member} was removed the role ${role}`),
                        ],
                    });
                    break;
            }
        }
    },
});
