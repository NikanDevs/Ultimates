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
const config_json_1 = require("../../json/config.json");
const __1 = require("../..");
exports.default = new Event_1.Event('guildMemberRemove', async (member) => {
    if (member.guild.id !== config_json_1.guild.id)
        return;
    if (member.user.bot)
        return;
    if (await member.guild.bans.fetch(member.user).catch(() => { }))
        return;
    const auditLogs = await member.guild.fetchAuditLogs({
        limit: 10,
        type: v9_1.AuditLogEvent.MemberKick,
    });
    const findCase = auditLogs.entries.find((log) => log.target.id === member.id);
    if (!findCase)
        return;
    const { executor, reason } = findCase;
    if (executor.bot)
        return;
    const data_ = new punishments_1.punishmentModel({
        _id: await (0, generatePunishmentId_1.generateManualId)(),
        case: await (0, modCase_1.getModCase)(),
        type: PunishmentType_1.PunishmentType.Kick,
        userId: member.id,
        moderatorId: executor.id,
        reason: reason || __1.client.config.moderation.default.reason,
        date: new Date(),
        expire: constants_1.punishmentExpiry,
    });
    await data_.save();
    await (0, createModLog_1.createModLog)({
        action: PunishmentType_1.PunishmentType.Kick,
        punishmentId: data_._id,
        user: member.user,
        moderator: executor,
        reason: reason,
        expire: constants_1.punishmentExpiry,
    });
});
