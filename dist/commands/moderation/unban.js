"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modCase_1 = require("../../functions/cases/modCase");
const constants_1 = require("../../constants");
const createModLog_1 = require("../../functions/logs/createModLog");
const punishments_1 = require("../../models/punishments");
const Command_1 = require("../../structures/Command");
const PunishmentType_1 = require("../../typings/PunishmentType");
const generatePunishmentId_1 = require("../../utils/generatePunishmentId");
const interactions_1 = require("../../interactions");
exports.default = new Command_1.Command({
    interaction: interactions_1.interactions.unban,
    excute: async ({ client, interaction, options }) => {
        const userId = options.getString('user');
        const reason = options.getString('reason') || client.config.moderation.default.reason;
        const bannedMember = await interaction.guild.bans.fetch(userId).catch(() => { });
        if (!bannedMember)
            return interaction.reply({
                embeds: [
                    client.embeds.error("I wasn't able to find a banned member with that ID."),
                ],
                ephemeral: true,
            });
        await interaction.guild.bans.remove(userId);
        if (bannedMember.user.bot)
            return interaction.reply({
                embeds: [client.embeds.success(`**${bannedMember.user.tag}** was unbanned.`)],
                ephemeral: true,
            });
        const data = new punishments_1.punishmentModel({
            _id: await (0, generatePunishmentId_1.generateManualId)(),
            case: await (0, modCase_1.getModCase)(),
            type: PunishmentType_1.PunishmentType.Unban,
            userId: userId,
            moderatorId: interaction.user.id,
            reason: reason,
            date: new Date(),
            expire: constants_1.punishmentExpiry,
        });
        await data.save();
        await interaction.reply({
            embeds: [
                client.embeds.moderation(`**${bannedMember.user.tag}**`, {
                    action: PunishmentType_1.PunishmentType.Unban,
                    id: data._id,
                }),
            ],
            ephemeral: true,
        });
        await (0, createModLog_1.createModLog)({
            action: PunishmentType_1.PunishmentType.Unban,
            punishmentId: data._id,
            user: bannedMember.user,
            moderator: interaction.user,
            reason: reason,
            expire: constants_1.punishmentExpiry,
        });
    },
});
