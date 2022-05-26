"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const createModLog_1 = require("../functions/logs/createModLog");
const durations_1 = require("../models/durations");
const Event_1 = require("../structures/Event");
const PunishmentType_1 = require("../typings/PunishmentType");
exports.default = new Event_1.Event('messageCreate', async (message) => {
    // Unmutes
    const findTimeouts = await durations_1.durationsModel.find({ type: PunishmentType_1.PunishmentType.Timeout });
    const filterTimeout = findTimeouts?.filter((c) => Date.now() > c?.date?.getTime() + c.duration);
    if (!filterTimeout)
        return;
    filterTimeout.forEach(async (data) => {
        await data.delete();
        const guildMember = (await message.guild.members?.fetch(data.userId));
        const findUser = (await __1.client.users
            .fetch(data.userId, { force: true })
            .catch(() => { }));
        if (guildMember)
            guildMember.timeout(null, 'Timeout ended based on the duration.');
        await (0, createModLog_1.createModLog)({
            action: PunishmentType_1.PunishmentType.Unmute,
            user: findUser,
            moderator: __1.client.user,
            reason: 'Timeout ended based on the duration.',
            referencedPunishment: data,
        });
    });
    // Unbans
    const findSoftbans = await durations_1.durationsModel.find({ type: PunishmentType_1.PunishmentType.Softban });
    const filterSoftbans = findSoftbans?.filter((c) => Date.now() > c.date.getTime() + c.duration);
    let reason = '~~Unbanned due to softban duration~~ Already unbanned.';
    if (!filterTimeout)
        return;
    filterSoftbans.forEach(async (data) => {
        await data.delete();
        const bannedMember = await message.guild.bans?.fetch(data.userId).catch(() => { });
        const findUser = (await __1.client.users
            .fetch(data.userId, { force: true })
            .catch(() => { }));
        if (bannedMember || bannedMember !== undefined) {
            reason = 'Unbanned due to softban duration.';
            await message.guild.bans?.remove(data.userId);
        }
        await (0, createModLog_1.createModLog)({
            action: PunishmentType_1.PunishmentType.Unban,
            user: findUser,
            moderator: __1.client.user,
            reason: reason,
            referencedPunishment: data,
        });
    });
});
