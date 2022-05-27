"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Command_1 = require("../../structures/Command");
const ms_1 = tslib_1.__importDefault(require("ms"));
const punishments_1 = require("../../models/punishments");
const constants_1 = require("../../constants");
const durations_1 = require("../../models/durations");
const PunishmentType_1 = require("../../typings/PunishmentType");
const generatePunishmentId_1 = require("../../utils/generatePunishmentId");
const modCase_1 = require("../../functions/cases/modCase");
const createModLog_1 = require("../../functions/logs/createModLog");
const timeoutMember_1 = require("../../utils/timeoutMember");
const getsIgnored_1 = require("../../functions/getsIgnored");
const moderation_json_1 = require("../../json/moderation.json");
const sendModDM_1 = require("../../utils/sendModDM");
const timeout_1 = require("../../interactions/moderation/timeout");
exports.default = new Command_1.Command({
    interaction: timeout_1.timeoutCommand,
    excute: async ({ client, interaction, options }) => {
        const member = options.getMember('member');
        const duration = options.getString('duration') || moderation_json_1.default_config.timeout_duration;
        const reason = options.getString('reason') || moderation_json_1.default_config.reason;
        if ((0, getsIgnored_1.getsIgnored)(interaction, member))
            return;
        if (member.permissions.has('Administrator'))
            return interaction.reply({
                embeds: [client.embeds.error("Administrators can't be timed out.")],
                ephemeral: true,
            });
        // Trying to guess if the mod is tryin to unmute
        if (['off', 'end', 'expire', 'null', '0', 'zero', 'remove'].includes(duration.toLowerCase()))
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
        if ((0, ms_1.default)(duration) === undefined)
            return interaction.reply({
                embeds: [
                    client.embeds.error('The provided duration must be in `1w, 1h, 1m` format.'),
                ],
                ephemeral: true,
            });
        if ((0, ms_1.default)(duration) > 1000 * 60 * 60 * 24 * 27 || (0, ms_1.default)(duration) < 10000)
            return interaction.reply({
                embeds: [
                    client.embeds.attention('The duration must be between 10 seconds and 27 days.'),
                ],
                ephemeral: true,
            });
        await (0, timeoutMember_1.timeoutMember)(member, { duration: (0, ms_1.default)(duration), reason: reason });
        const data = new punishments_1.punishmentModel({
            _id: (0, generatePunishmentId_1.generateManualId)(),
            case: await (0, modCase_1.getModCase)(),
            type: PunishmentType_1.PunishmentType.Timeout,
            userId: member.id,
            moderatorId: interaction.user.id,
            reason: reason,
            date: new Date(),
            expire: new Date(constants_1.warningExpiry.getTime() + (0, ms_1.default)(duration)),
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
            expire: new Date(Date.now() + (0, ms_1.default)(duration)),
        });
        await (0, createModLog_1.createModLog)({
            action: PunishmentType_1.PunishmentType.Timeout,
            punishmentId: data._id,
            duration: (0, ms_1.default)(duration),
            user: member.user,
            moderator: interaction.user,
            reason: reason,
        });
    },
});
