"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const modCase_1 = require("../../functions/cases/modCase");
const constants_1 = require("../../constants");
const getsIgnored_1 = require("../../functions/getsIgnored");
const createModLog_1 = require("../../functions/logs/createModLog");
const punishments_1 = require("../../models/punishments");
const Command_1 = require("../../structures/Command");
const PunishmentType_1 = require("../../typings/PunishmentType");
const generatePunishmentId_1 = require("../../utils/generatePunishmentId");
const ms_1 = tslib_1.__importDefault(require("ms"));
const durations_1 = require("../../models/durations");
const moderation_json_1 = require("../../json/moderation.json");
const sendModDM_1 = require("../../utils/sendModDM");
exports.default = new Command_1.Command({
    name: 'softban',
    description: 'Softbans a member from the server.',
    directory: 'moderation',
    cooldown: 3000,
    permission: ['BanMembers'],
    options: [
        {
            name: 'member',
            description: 'The member you wish to softban.',
            type: discord_js_1.ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'duration',
            description: 'The duration you want the member to be banned for.',
            type: discord_js_1.ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: 'delete_messages',
            description: 'The amount of days to delete messages for.',
            type: discord_js_1.ApplicationCommandOptionType.Number,
            required: false,
            choices: [
                { name: "Don't delete any", value: 0 },
                { name: 'Previous 24 hours', value: 1 },
                { name: 'Previous 48 hours', value: 2 },
                { name: 'Previous 3 days', value: 3 },
                { name: 'Previous 4 days', value: 4 },
                { name: 'Previous 5 days', value: 5 },
                { name: 'Previous 6 days', value: 6 },
                { name: 'Previous 7 days', value: 7 },
            ],
        },
        {
            name: 'reason',
            description: 'The reason of the softban.',
            type: discord_js_1.ApplicationCommandOptionType.String,
            required: false,
            autocomplete: true,
        },
    ],
    excute: async ({ client, interaction, options }) => {
        const member = options.getMember('member');
        const reason = options.getString('reason') || moderation_json_1.default_config.reason;
        const delete_messages = options.getNumber('delete_messages') || moderation_json_1.default_config.ban_delete_messages;
        const duration = options.getString('duration') || moderation_json_1.default_config.softban_duration;
        if ((0, getsIgnored_1.getsIgnored)(interaction, member))
            return;
        if ((0, ms_1.default)(duration) === undefined)
            return interaction.reply({
                embeds: [
                    client.embeds.error('The provided duration must be in `1y, 8w, 1w, 1h, 1m` format.'),
                ],
                ephemeral: true,
            });
        if ((0, ms_1.default)(duration) > 1000 * 60 * 60 * 24 * 365 || (0, ms_1.default)(duration) < 60000)
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
            userId: member.id,
            moderatorId: interaction.user.id,
            reason: reason,
            date: new Date(),
            expire: new Date(constants_1.punishmentExpiry.getTime() + (0, ms_1.default)(duration)),
        });
        await data.save();
        await (0, sendModDM_1.sendModDM)(member, {
            action: PunishmentType_1.PunishmentType.Softban,
            punishment: data,
            expire: new Date((0, ms_1.default)(duration)),
        });
        await member.ban({ reason: reason, deleteMessageDays: delete_messages });
        const durationData = new durations_1.durationsModel({
            case: await (0, modCase_1.getModCase)(),
            type: PunishmentType_1.PunishmentType.Softban,
            userId: member.user.id,
            date: new Date(),
            endsAt: (0, ms_1.default)(duration),
        });
        await durationData.save();
        await interaction.reply({
            embeds: [
                client.embeds.moderation(member.user, {
                    action: PunishmentType_1.PunishmentType.Softban,
                    id: data._id,
                }),
            ],
            ephemeral: true,
        });
        await (0, createModLog_1.createModLog)({
            action: PunishmentType_1.PunishmentType.Softban,
            punishmentId: data._id,
            user: member.user,
            duration: (0, ms_1.default)(duration),
            moderator: interaction.user,
            reason: reason,
        });
    },
});
