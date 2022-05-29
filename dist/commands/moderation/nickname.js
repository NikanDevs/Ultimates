"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../structures/Command");
const moderation_json_1 = require("../../json/moderation.json");
const getsIgnored_1 = require("../../functions/getsIgnored");
const interactions_1 = require("../../interactions");
exports.default = new Command_1.Command({
    interaction: interactions_1.interactions.nickname,
    excute: async ({ client, interaction, options }) => {
        const member = options.getMember('member');
        const newNick = options.getString('nickname');
        let auditLogReason = '/nickname was excuted by a moderator.';
        if ((0, getsIgnored_1.getsIgnored)(interaction, member))
            return;
        if (newNick) {
            // Expect err
            if (newNick.length > 32)
                return interaction.reply({
                    embeds: [
                        client.embeds.error('The nickname must be 32 of fewer in length.'),
                    ],
                    ephemeral: true,
                });
            // Set the nickname
            member.setNickname(newNick, auditLogReason);
            interaction.reply({
                embeds: [
                    client.embeds.success(`**${member.user.tag}** nickname was set to **${newNick}**`),
                ],
            });
        }
        else if (!newNick && !member.nickname) {
            // Moderates the nickname
            function generateNick() {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
                let nickname = '';
                for (var i = 0; i < moderation_json_1.lengths['moderated-nickname']; i++) {
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
            // Resets the nickname
            member.setNickname(null, auditLogReason);
            interaction.reply({
                embeds: [client.embeds.success(`**${member.user.tag}** nickname was reset.`)],
            });
        }
    },
});
