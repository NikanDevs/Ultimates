"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../structures/Command");
const punishments_1 = require("../../models/punishments");
const constants_1 = require("../../constants");
const durations_1 = require("../../models/durations");
const PunishmentType_1 = require("../../typings/PunishmentType");
const generatePunishmentId_1 = require("../../utils/generatePunishmentId");
const modCase_1 = require("../../functions/cases/modCase");
const createModLog_1 = require("../../functions/logs/createModLog");
const timeoutMember_1 = require("../../utils/timeoutMember");
const ignore_1 = require("../../functions/ignore");
const sendModDM_1 = require("../../utils/sendModDM");
const interactions_1 = require("../../interactions");
const convertTime_1 = require("../../functions/convertTime");
exports.default = new Command_1.Command({
    interaction: interactions_1.interactions.timeout,
    excute: async ({ client, interaction, options }) => {
        const member = options.getMember('member');
        const durationO = options.getString('duration') || client.config.moderation.default.timeout;
        const duration = (0, convertTime_1.convertToTimestamp)(durationO);
        const reason = options.getString('reason') || client.config.moderation.default.reason;
        if ((0, ignore_1.ignore)(member, { interaction, action: PunishmentType_1.PunishmentType.Timeout }))
            return;
        // Guess: moderator is trying to unmute
        if (['off', 'end', 'expire', 'null', '0', 'zero', 'remove'].includes(options.getString('duration').toLowerCase()))
            return interaction.reply({
                embeds: [
                    client.embeds.attention("If you're trying to unmute a member, try using `/punishment revoke`"),
                ],
                ephemeral: true,
            });
        if (await durations_1.durationsModel.findOne({ userId: member.id }))
            return interaction.reply({
                embeds: [client.embeds.error('This member is already timed out.')],
                ephemeral: true,
            });
        if (!(0, convertTime_1.isValidDuration)(durationO))
            return interaction.reply({
                embeds: [
                    client.embeds.error('The provided duration is not valid, use the autocomplete for a better result.'),
                ],
                ephemeral: true,
            });
        if (duration > constants_1.MAX_TIMEOUT_DURATION || duration < constants_1.MIN_TIMEOUT_DURATION)
            return interaction.reply({
                embeds: [
                    client.embeds.attention(`The duration must be between ${(0, convertTime_1.convertTime)(constants_1.MIN_TIMEOUT_DURATION)} and ${(0, convertTime_1.convertTime)(constants_1.MAX_TIMEOUT_DURATION)}.`),
                ],
                ephemeral: true,
            });
        await (0, timeoutMember_1.timeoutMember)(member, { duration: duration, reason: reason });
        const data = new punishments_1.punishmentModel({
            _id: (0, generatePunishmentId_1.generateManualId)(),
            case: await (0, modCase_1.getModCase)(),
            type: PunishmentType_1.PunishmentType.Timeout,
            userId: member.id,
            moderatorId: interaction.user.id,
            reason: reason,
            date: new Date(),
            expire: new Date(constants_1.warningExpiry.getTime() + duration),
        });
        await data.save();
        await interaction.reply({
            embeds: [
                client.embeds.moderation(member.user, {
                    action: PunishmentType_1.PunishmentType.Timeout,
                    id: data._id,
                }),
            ],
            ephemeral: true,
        });
        await (0, sendModDM_1.sendModDM)(member, {
            action: PunishmentType_1.PunishmentType.Timeout,
            punishment: data,
            expire: new Date(Date.now() + duration),
        });
        await (0, createModLog_1.createModLog)({
            action: PunishmentType_1.PunishmentType.Timeout,
            punishmentId: data._id,
            duration: duration,
            user: member.user,
            moderator: interaction.user,
            reason: reason,
        });
    },
});
