"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const modCase_1 = require("../../functions/cases/modCase");
const constants_1 = require("../../constants");
const getsIgnored_1 = require("../../functions/getsIgnored");
const createModLog_1 = require("../../functions/logs/createModLog");
const punishments_1 = require("../../models/punishments");
const Command_1 = require("../../structures/Command");
const PunishmentType_1 = require("../../typings/PunishmentType");
const generatePunishmentId_1 = require("../../utils/generatePunishmentId");
const moderation_json_1 = require("../../json/moderation.json");
const sendModDM_1 = require("../../utils/sendModDM");
exports.default = new Command_1.Command({
    name: 'ban',
    description: 'Bans a member from the server.',
    directory: 'moderation',
    cooldown: 3000,
    permission: ['BanMembers'],
    options: [
        {
            name: 'user',
            description: 'The user you wish to ban.',
            type: discord_js_1.ApplicationCommandOptionType.User,
            required: true,
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
            description: 'The reason of the ban.',
            type: discord_js_1.ApplicationCommandOptionType.String,
            required: false,
            autocomplete: true,
        },
    ],
    excute: async ({ client, interaction, options }) => {
        const user = options.getUser('user');
        const member = options.getMember('user');
        const reason = options.getString('reason') || moderation_json_1.default_config.reason;
        const delete_messages = options.getNumber('delete_messages') || moderation_json_1.default_config.ban_delete_messages;
        if (member)
            if ((0, getsIgnored_1.getsIgnored)(interaction, member))
                return;
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
