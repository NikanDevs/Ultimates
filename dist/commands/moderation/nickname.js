"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../structures/Command");
const ignore_1 = require("../../functions/ignore");
const interactions_1 = require("../../interactions");
const PunishmentType_1 = require("../../typings/PunishmentType");
exports.default = new Command_1.Command({
    interaction: interactions_1.interactions.nickname,
    excute: async ({ client, interaction, options }) => {
        const member = options.getMember('member');
        const newNick = options.getString('nickname');
        let auditLogReason = '/nickname was excuted by a moderator.';
        if ((0, ignore_1.ignore)(member, { interaction, action: PunishmentType_1.PunishmentType.Unknown }))
            return;
        if (!member)
            return interaction.reply({
                embeds: [client.embeds.error('I could not find that member in this server.')],
                ephemeral: true,
            });
        if (newNick) {
            // Set a new nickname
            if (newNick.length > 32)
                return interaction.reply({
                    embeds: [
                        client.embeds.error('The nickname must be 32 or fewer in length.'),
                    ],
                    ephemeral: true,
                });
            member.setNickname(newNick, auditLogReason);
            interaction.reply({
                embeds: [
                    client.embeds.success(`**${member.user.tag}** nickname was set to **${newNick}**`),
                ],
            });
        }
        else if (!newNick && !member.nickname) {
            // Moderate the nickname
            function generateNick() {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
                let nickname = '';
                for (var i = 0; i < 5; i++) {
                    nickname += characters.charAt(Math.floor(Math.random() * characters.length));
                }
                return nickname;
            }
            member.setNickname(`Moderated Nickname ` + generateNick(), auditLogReason);
            interaction.reply({
                embeds: [
                    client.embeds.success(`**${member.user.tag}** nickname was moderated.`),
                ],
            });
        }
        else if (!newNick && member.nickname) {
            // Reset the nickname
            member.setNickname(null, auditLogReason);
            interaction.reply({
                embeds: [client.embeds.success(`**${member.user.tag}** nickname was reset.`)],
            });
        }
    },
});
