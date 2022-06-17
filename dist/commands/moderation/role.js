"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ignore_1 = require("../../functions/ignore");
const interactions_1 = require("../../interactions");
const Command_1 = require("../../structures/Command");
const PunishmentType_1 = require("../../typings/PunishmentType");
exports.default = new Command_1.Command({
    interaction: interactions_1.interactions.role,
    excute: async ({ client, interaction, options }) => {
        const getSubCommand = options.getSubcommand();
        if (getSubCommand === 'edit') {
            const member = options.getMember('member');
            const role = options.getRole('role');
            if (!member)
                return interaction.reply({
                    embeds: [
                        client.embeds.error('I could not find that member in this server.'),
                    ],
                    ephemeral: true,
                });
            if ((0, ignore_1.ignore)(member, { interaction, action: PunishmentType_1.PunishmentType.Unknown }))
                return;
            if (role.position > interaction.guild.members.me.roles.highest.position ||
                role.managed)
                return interaction.reply({
                    embeds: [
                        client.embeds.error("I don't have enough permissions to manage that role."),
                    ],
                    ephemeral: true,
                });
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
                        client.embeds.error(`Woah! That role has some moderation powers, try ${member.roles.cache.has(role.id) ? 'removing' : 'adding'} it yourself.`),
                    ],
                    ephemeral: true,
                });
            switch (member.roles.cache.has(role.id)) {
                case false:
                    await member.roles.add(role);
                    await interaction.reply({
                        embeds: [client.embeds.success(`${role} was added to ${member}`)],
                    });
                    break;
                case true:
                    await member.roles.remove(role);
                    await interaction.reply({
                        embeds: [client.embeds.success(`${role} was removed from ${member}`)],
                    });
                    break;
            }
        }
    },
});
