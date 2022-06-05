"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Event_1 = require("../../structures/Event");
const v9_1 = require("discord-api-types/v9");
const punishments_1 = require("../../models/punishments");
const PunishmentType_1 = require("../../typings/PunishmentType");
const constants_1 = require("../../constants");
const generatePunishmentId_1 = require("../../utils/generatePunishmentId");
const modCase_1 = require("../../functions/cases/modCase");
const createModLog_1 = require("../../functions/logs/createModLog");
const timeoutMember_1 = require("../../utils/timeoutMember");
const moderation_json_1 = require("../../json/moderation.json");
const sendModDM_1 = require("../../utils/sendModDM");
const config_json_1 = require("../../json/config.json");
exports.default = new Event_1.Event('guildMemberUpdate', async (oldMember, newMember) => {
    if (newMember.guild.id !== config_json_1.guild.id)
        return;
    if (newMember.user.bot)
        return;
    await oldMember.fetch().catch(() => { });
    if (!oldMember.communicationDisabledUntil && newMember.communicationDisabledUntil) {
        const auditLogs = await newMember.guild.fetchAuditLogs({
            limit: 10,
            type: v9_1.AuditLogEvent.MemberUpdate,
        });
        const findCase = auditLogs.entries.find((log) => log.target.id === newMember.user.id);
        if (!findCase)
            return;
        const { executor, reason, changes } = findCase;
        if (executor.bot)
            return;
        const rawDuration = new Date(changes[0].new.toString()).getTime() - Date.now();
        const duration = ~~(Math.ceil(rawDuration / 1000 / 10) * 10) * 1000; // Rounding up to 10s -> 58 secs to 60 secs
        await (0, timeoutMember_1.timeoutMember)(newMember, { duration: duration, reason: reason });
        const data_ = new punishments_1.punishmentModel({
            _id: (0, generatePunishmentId_1.generateManualId)(),
            case: await (0, modCase_1.getModCase)(),
            type: PunishmentType_1.PunishmentType.Timeout,
            userId: newMember.user.id,
            moderatorId: executor.id,
            reason: reason || moderation_json_1.default_config.reason,
            date: new Date(),
            expire: new Date(constants_1.warningExpiry.getTime() + duration),
        });
        await data_.save();
        await (0, sendModDM_1.sendModDM)(newMember, {
            action: PunishmentType_1.PunishmentType.Timeout,
            expire: new Date(duration),
            punishment: data_,
        });
        await (0, createModLog_1.createModLog)({
            action: PunishmentType_1.PunishmentType.Timeout,
            punishmentId: data_._id,
            user: newMember.user,
            moderator: executor,
            reason: reason,
            duration: duration,
        });
    }
});
