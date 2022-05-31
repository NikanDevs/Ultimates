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
const durations_1 = require("../../models/durations");
const moderation_json_1 = require("../../json/moderation.json");
const sendModDM_1 = require("../../utils/sendModDM");
const interactions_1 = require("../../interactions");
const convertTime_1 = require("../../functions/convertTime");
exports.default = new Command_1.Command({
    interaction: interactions_1.interactions.softban,
    excute: async ({ client, interaction, options }) => {
        const user = options.getUser('user');
        const member = options.getMember('user');
        const reason = options.getString('reason') || moderation_json_1.default_config.reason;
        const delete_messages = options.getNumber('delete_messages') || moderation_json_1.default_config.ban_delete_messages;
        const durationO = options.getString('duration') || moderation_json_1.default_config.softban_duration;
        const duration = /^\d+$/.test(durationO) ? parseInt(durationO) : +(0, convertTime_1.convertTime)(durationO);
        if (member)
            if ((0, ignore_1.ignore)(member, { interaction, action: PunishmentType_1.PunishmentType.Softban }))
                return;
        if (duration === undefined)
            return interaction.reply({
                embeds: [
                    client.embeds.error('The provided duration is not valid, use the autocomplete for a better result.'),
                ],
                ephemeral: true,
            });
        if (duration > 1000 * 60 * 60 * 24 * 365 || duration < 60000)
            return interaction.reply({
                embeds: [
                    client.embeds.attention('The duration must be between 1 minute and 1 year.'),
                ],
                ephemeral: true,
            });
        const data = new punishments_1.punishmentModel({
            _id: (0, generatePunishmentId_1.generateManualId)(),
            case: await (0, modCase_1.getModCase)(),
            type: PunishmentType_1.PunishmentType.Softban,
            userId: user.id,
            moderatorId: interaction.user.id,
            reason: reason,
            date: new Date(),
            expire: new Date(constants_1.punishmentExpiry.getTime() + duration),
        });
        await data.save();
        if (member)
            await (0, sendModDM_1.sendModDM)(member, {
                action: PunishmentType_1.PunishmentType.Softban,
                punishment: data,
                expire: new Date(duration),
            });
        await interaction.guild.members.ban(user, {
            deleteMessageDays: delete_messages,
            reason: reason,
        });
        const durationData = new durations_1.durationsModel({
            case: await (0, modCase_1.getModCase)(),
            type: PunishmentType_1.PunishmentType.Softban,
            userId: user.id,
            date: new Date(),
            endsAt: duration,
        });
        await durationData.save();
        await interaction.reply({
            embeds: [
                client.embeds.moderation(member ? user : user.tag, {
                    action: PunishmentType_1.PunishmentType.Softban,
                    id: data._id,
                }),
            ],
            ephemeral: true,
        });
        await (0, createModLog_1.createModLog)({
            action: PunishmentType_1.PunishmentType.Softban,
            punishmentId: data._id,
            user: user,
            duration: duration,
            moderator: interaction.user,
            reason: reason,
        });
    },
});
