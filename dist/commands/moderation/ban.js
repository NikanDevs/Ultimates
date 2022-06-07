"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modCase_1 = require("../../functions/cases/modCase");
const constants_1 = require("../../constants");
const ignore_1 = require("../../functions/ignore");
const createModLog_1 = require("../../functions/logs/createModLog");
const punishments_1 = require("../../models/punishments");
const Command_1 = require("../../structures/Command");
const PunishmentType_1 = require("../../typings/PunishmentType");
const generatePunishmentId_1 = require("../../utils/generatePunishmentId");
const sendModDM_1 = require("../../utils/sendModDM");
const interactions_1 = require("../../interactions");
exports.default = new Command_1.Command({
    interaction: interactions_1.interactions.ban,
    excute: async ({ client, interaction, options }) => {
        const user = options.getUser('user');
        const member = options.getMember('user');
        const reason = options.getString('reason') || client.config.moderation.default.reason;
        const delete_messages = options.getNumber('delete_messages') || client.config.moderation.default.msgs;
        if (member)
            if ((0, ignore_1.ignore)(member, { interaction, action: PunishmentType_1.PunishmentType.Ban }))
                return;
        if (await interaction.guild.bans.fetch(user.id).catch(() => { }))
            return interaction.reply({
                embeds: [client.embeds.error('This user is already banned from the server.')],
                ephemeral: true,
            });
        const data = new punishments_1.punishmentModel({
            _id: (0, generatePunishmentId_1.generateManualId)(),
            case: await (0, modCase_1.getModCase)(),
            type: PunishmentType_1.PunishmentType.Ban,
            userId: user.id,
            moderatorId: interaction.user.id,
            reason: reason,
            date: new Date(),
            expire: constants_1.punishmentExpiry,
        });
        await data.save();
        if (member)
            await (0, sendModDM_1.sendModDM)(member, {
                action: PunishmentType_1.PunishmentType.Ban,
                punishment: data,
            });
        await interaction.guild.members.ban(user, {
            deleteMessageDays: delete_messages,
            reason: reason,
        });
        await interaction.reply({
            embeds: [
                client.embeds.moderation(member ? user : user.tag, {
                    action: PunishmentType_1.PunishmentType.Ban,
                    id: data._id,
                }),
            ],
            ephemeral: true,
        });
        await (0, createModLog_1.createModLog)({
            action: PunishmentType_1.PunishmentType.Ban,
            punishmentId: data._id,
            user: user,
            moderator: interaction.user,
            reason: reason,
            expire: constants_1.punishmentExpiry,
        });
    },
});
