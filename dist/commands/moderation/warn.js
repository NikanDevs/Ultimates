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
const moderation_json_1 = require("../../json/moderation.json");
const interactions_1 = require("../../interactions");
const convertTime_1 = require("../../functions/convertTime");
var reasons;
(function (reasons) {
    reasons["two"] = "Reaching 2 manual warnings.";
    reasons["four"] = "Reaching 4 manual warnings.";
    reasons["six"] = "Reaching 6 manual warnings.";
})(reasons || (reasons = {}));
var durations;
(function (durations) {
    durations[durations["two"] = +(0, convertTime_1.convertTime)(moderation_json_1.auto_mute[2])] = "two";
    durations[durations["four"] = +(0, convertTime_1.convertTime)(moderation_json_1.auto_mute[4])] = "four";
})(durations || (durations = {}));
exports.default = new Command_1.Command({
    interaction: interactions_1.interactions.warn,
    excute: async ({ client, interaction, options }) => {
        const member = options.getMember('member');
        const reason = options.getString('reason') || moderation_json_1.default_config.reason;
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
                case 2:
                    await (0, timeoutMember_1.timeoutMember)(member, {
                        duration: durations['two'],
                        reason: reasons['two'],
                    });
                    const data = new punishments_1.punishmentModel({
                        _id: (0, generatePunishmentId_1.generateManualId)(),
                        case: await (0, modCase_1.getModCase)(),
                        type: PunishmentType_1.PunishmentType.Timeout,
                        userId: member.id,
                        moderatorId: client.user.id,
                        reason: reasons['two'],
                        date: new Date(),
                        expire: new Date(constants_1.warningExpiry.getTime() + durations.two),
                    });
                    data.save();
                    await (0, createModLog_1.createModLog)({
                        action: PunishmentType_1.PunishmentType.Timeout,
                        punishmentId: data._id,
                        user: member.user,
                        moderator: client.user,
                        reason: reasons['two'],
                        duration: durations['two'],
                        referencedPunishment: warnData,
                    });
                    (0, sendModDM_1.sendModDM)(member, {
                        action: PunishmentType_1.PunishmentType.Timeout,
                        punishment: data,
                        expire: new Date(Date.now() + durations.two),
                    });
                    break;
                case 4:
                    await (0, timeoutMember_1.timeoutMember)(member, {
                        duration: durations['four'],
                        reason: reasons['four'],
                    });
                    const data2 = new punishments_1.punishmentModel({
                        _id: (0, generatePunishmentId_1.generateManualId)(),
                        case: await (0, modCase_1.getModCase)(),
                        type: PunishmentType_1.PunishmentType.Timeout,
                        userId: member.id,
                        moderatorId: client.user.id,
                        reason: reasons['four'],
                        date: new Date(),
                        expire: new Date(constants_1.warningExpiry.getTime() + durations.two),
                    });
                    data2.save();
                    await (0, createModLog_1.createModLog)({
                        action: PunishmentType_1.PunishmentType.Timeout,
                        punishmentId: data2._id,
                        user: member.user,
                        moderator: client.user,
                        reason: reasons['four'],
                        duration: durations['four'],
                        referencedPunishment: warnData,
                    });
                    (0, sendModDM_1.sendModDM)(member, {
                        action: PunishmentType_1.PunishmentType.Timeout,
                        punishment: data2,
                        expire: new Date(Date.now() + durations.four),
                    });
                    break;
                case 6:
                    const data3 = new punishments_1.punishmentModel({
                        _id: (0, generatePunishmentId_1.generateManualId)(),
                        case: await (0, modCase_1.getModCase)(),
                        type: PunishmentType_1.PunishmentType.Ban,
                        userId: member.id,
                        moderatorId: client.user.id,
                        reason: reasons['six'],
                        date: new Date(),
                        expire: constants_1.punishmentExpiry,
                    });
                    data3.save();
                    await (0, createModLog_1.createModLog)({
                        action: PunishmentType_1.PunishmentType.Ban,
                        punishmentId: data3._id,
                        user: member.user,
                        moderator: client.user,
                        reason: reasons['six'],
                        referencedPunishment: warnData,
                        expire: constants_1.punishmentExpiry,
                    });
                    await (0, sendModDM_1.sendModDM)(member, {
                        action: PunishmentType_1.PunishmentType.Ban,
                        punishment: data3,
                    });
                    await member.ban({
                        reason: reasons['six'],
                        deleteMessageDays: moderation_json_1.default_config.ban_delete_messages,
                    });
                    break;
            }
        });
    },
});
