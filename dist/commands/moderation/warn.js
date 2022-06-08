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
const timeoutMember_1 = require("../../utils/timeoutMember");
const sendModDM_1 = require("../../utils/sendModDM");
const interactions_1 = require("../../interactions");
const durations_1 = require("../../models/durations");
exports.default = new Command_1.Command({
    interaction: interactions_1.interactions.warn,
    excute: async ({ client, interaction, options }) => {
        const member = options.getMember('member');
        const reason = options.getString('reason') || client.config.moderation.default.reason;
        if ((0, ignore_1.ignore)(member, { interaction, action: PunishmentType_1.PunishmentType.Warn }))
            return;
        const warnData = new punishments_1.punishmentModel({
            _id: (0, generatePunishmentId_1.generateManualId)(),
            case: await (0, modCase_1.getModCase)(),
            type: PunishmentType_1.PunishmentType.Warn,
            userId: member.id,
            moderatorId: interaction.user.id,
            reason: reason,
            date: new Date(),
            expire: constants_1.warningExpiry,
        });
        await warnData.save();
        interaction.reply({
            embeds: [
                client.embeds.moderation(member.user, {
                    action: PunishmentType_1.PunishmentType.Warn,
                    id: warnData._id,
                }),
            ],
            ephemeral: true,
        });
        (0, sendModDM_1.sendModDM)(member, {
            action: PunishmentType_1.PunishmentType.Warn,
            expire: warnData.expire,
            punishment: warnData,
        });
        await (0, createModLog_1.createModLog)({
            action: PunishmentType_1.PunishmentType.Warn,
            punishmentId: warnData._id,
            user: member.user,
            moderator: interaction.user,
            reason: reason,
            expire: constants_1.warningExpiry,
        }).then(async () => {
            // ------------------------------------- checking for auto action on warn counts --------------------------------
            const findWarnings = await punishments_1.punishmentModel.find({
                userId: member.id,
                type: PunishmentType_1.PunishmentType.Warn,
            });
            const warningsCount = findWarnings.length;
            switch (warningsCount) {
                case client.config.moderation.count.timeout1:
                    await (0, timeoutMember_1.timeoutMember)(member, {
                        duration: client.config.moderation.duration.timeout1,
                        reason: `Reaching ${client.config.moderation.count.timeout1} warnings.`,
                    });
                    const data = new punishments_1.punishmentModel({
                        _id: (0, generatePunishmentId_1.generateManualId)(),
                        case: await (0, modCase_1.getModCase)(),
                        type: PunishmentType_1.PunishmentType.Timeout,
                        userId: member.id,
                        moderatorId: client.user.id,
                        reason: `Reaching ${client.config.moderation.count.timeout1} warnings.`,
                        date: new Date(),
                        expire: new Date(constants_1.warningExpiry.getTime() +
                            client.config.moderation.duration.timeout1),
                    });
                    data.save();
                    await (0, createModLog_1.createModLog)({
                        action: PunishmentType_1.PunishmentType.Timeout,
                        punishmentId: data._id,
                        user: member.user,
                        moderator: client.user,
                        reason: `Reaching ${client.config.moderation.count.timeout1} warnings.`,
                        duration: client.config.moderation.duration.timeout1,
                        referencedPunishment: warnData,
                    });
                    (0, sendModDM_1.sendModDM)(member, {
                        action: PunishmentType_1.PunishmentType.Timeout,
                        punishment: data,
                        expire: new Date(Date.now() + client.config.moderation.duration.timeout1),
                    });
                    break;
                case client.config.moderation.count.timeout2:
                    await (0, timeoutMember_1.timeoutMember)(member, {
                        duration: client.config.moderation.duration.timeout2,
                        reason: `Reaching ${client.config.moderation.count.timeout2} warnings.`,
                    });
                    const data2 = new punishments_1.punishmentModel({
                        _id: (0, generatePunishmentId_1.generateManualId)(),
                        case: await (0, modCase_1.getModCase)(),
                        type: PunishmentType_1.PunishmentType.Timeout,
                        userId: member.id,
                        moderatorId: client.user.id,
                        reason: `Reaching ${client.config.moderation.count.timeout2} warnings.`,
                        date: new Date(),
                        expire: new Date(constants_1.warningExpiry.getTime() +
                            client.config.moderation.duration.timeout2),
                    });
                    data2.save();
                    await (0, createModLog_1.createModLog)({
                        action: PunishmentType_1.PunishmentType.Timeout,
                        punishmentId: data2._id,
                        user: member.user,
                        moderator: client.user,
                        reason: `Reaching ${client.config.moderation.count.timeout2} warnings.`,
                        duration: client.config.moderation.duration.timeout2,
                        referencedPunishment: warnData,
                    });
                    (0, sendModDM_1.sendModDM)(member, {
                        action: PunishmentType_1.PunishmentType.Timeout,
                        punishment: data2,
                        expire: new Date(Date.now() + client.config.moderation.duration.timeout2),
                    });
                    break;
                case client.config.moderation.count.ban:
                    switch (client.config.moderation.duration.ban) {
                        case null:
                            const data3 = new punishments_1.punishmentModel({
                                _id: (0, generatePunishmentId_1.generateManualId)(),
                                case: await (0, modCase_1.getModCase)(),
                                type: PunishmentType_1.PunishmentType.Ban,
                                userId: member.id,
                                moderatorId: client.user.id,
                                reason: `Reaching ${client.config.moderation.count.ban} warnings.`,
                                date: new Date(),
                                expire: constants_1.punishmentExpiry,
                            });
                            data3.save();
                            await (0, createModLog_1.createModLog)({
                                action: PunishmentType_1.PunishmentType.Ban,
                                punishmentId: data3._id,
                                user: member.user,
                                moderator: client.user,
                                reason: `Reaching ${client.config.moderation.count.ban} warnings.`,
                                referencedPunishment: warnData,
                                expire: constants_1.punishmentExpiry,
                            });
                            await (0, sendModDM_1.sendModDM)(member, {
                                action: PunishmentType_1.PunishmentType.Ban,
                                punishment: data3,
                            });
                            break;
                        default:
                            const data4 = new punishments_1.punishmentModel({
                                _id: (0, generatePunishmentId_1.generateManualId)(),
                                case: await (0, modCase_1.getModCase)(),
                                type: PunishmentType_1.PunishmentType.Softban,
                                userId: member.id,
                                moderatorId: client.user.id,
                                reason: `Reaching ${client.config.moderation.count.ban} warnings.`,
                                date: new Date(),
                                expire: new Date(constants_1.punishmentExpiry.getTime() +
                                    client.config.moderation.duration.ban),
                            });
                            data4.save();
                            await (0, createModLog_1.createModLog)({
                                action: PunishmentType_1.PunishmentType.Softban,
                                punishmentId: data4._id,
                                user: member.user,
                                moderator: client.user,
                                reason: `Reaching ${client.config.moderation.count.ban} warnings.`,
                                duration: client.config.moderation.duration.ban,
                                referencedPunishment: warnData,
                                expire: constants_1.punishmentExpiry,
                            });
                            await (0, sendModDM_1.sendModDM)(member, {
                                action: PunishmentType_1.PunishmentType.Softban,
                                punishment: data4,
                                expire: new Date(Date.now() + client.config.moderation.duration.ban),
                            });
                            const durationData = new durations_1.durationsModel({
                                case: await (0, modCase_1.getModCase)(),
                                type: PunishmentType_1.PunishmentType.Softban,
                                userId: member.user.id,
                                date: new Date(),
                                duration: client.config.moderation.duration.ban,
                            });
                            await durationData.save();
                            break;
                    }
                    await member.ban({
                        reason: `Reaching ${client.config.moderation.count.ban} warnings.`,
                        deleteMessageDays: client.config.moderation.default.msgs,
                    });
                    break;
            }
        });
    },
});
