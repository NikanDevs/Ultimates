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
const sendModDM_1 = require("../../utils/sendModDM");
const moderation_json_1 = require("../../json/moderation.json");
exports.default = new Command_1.Command({
    name: 'kick',
    description: 'Kicks a member from the server.',
    directory: 'moderation',
    cooldown: 300,
    permission: ['KickMembers'],
    options: [
        {
            name: 'member',
            description: 'The member you wish to kick.',
            type: discord_js_1.ApplicationCommandOptionType['User'],
            required: true,
        },
        {
            name: 'reason',
            description: 'The reason of this kick.',
            type: discord_js_1.ApplicationCommandOptionType['String'],
            required: false,
            autocomplete: true,
        },
    ],
    excute: async ({ client, interaction, options }) => {
        const member = options.getMember('member');
        const reason = options.getString('reason') || moderation_json_1.default_config.reason;
        if ((0, getsIgnored_1.getsIgnored)(interaction, member))
            return;
        const data = new punishments_1.punishmentModel({
            _id: (0, generatePunishmentId_1.generateManualId)(),
            case: await (0, modCase_1.getModCase)(),
            type: PunishmentType_1.PunishmentType.Kick,
            userId: member.id,
            moderatorId: interaction.user.id,
            reason: reason,
            date: new Date(),
            expire: constants_1.punishmentExpiry,
        });
        await data.save();
        await (0, sendModDM_1.sendModDM)(member, {
            action: PunishmentType_1.PunishmentType.Kick,
            punishment: data,
        });
        await member.kick(reason);
        await interaction.reply({
            embeds: [
                client.embeds.moderation(member.user, {
                    action: PunishmentType_1.PunishmentType.Kick,
                    id: data._id,
                }),
            ],
            ephemeral: true,
        });
        await (0, createModLog_1.createModLog)({
            action: PunishmentType_1.PunishmentType.Kick,
            punishmentId: data._id,
            user: member.user,
            moderator: interaction.user,
            reason: reason,
            expire: constants_1.punishmentExpiry,
        });
    },
});
