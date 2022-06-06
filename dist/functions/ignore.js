"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ignore = void 0;
const config_json_1 = require("../json/config.json");
const __1 = require("..");
const PunishmentType_1 = require("../typings/PunishmentType");
function ignore(member, options) {
    const interaction = options.interaction;
    const action = options.action;
    if (member.user.bot) {
        interaction.reply({
            embeds: [
                __1.client.embeds.error("You can't perform actions on bots. If necessary, use Discord's in-built functions."),
            ],
            ephemeral: true,
        });
        return true;
    }
    if (interaction.user.id === member.user.id) {
        interaction.reply({
            embeds: [
                __1.client.embeds.error("That doesn't work, maybe try listening to some music now [:)](https://takeb1nzyto.space/)"),
            ],
            ephemeral: true,
        });
        return true;
    }
    if (member.id === config_json_1.ownerId) {
        interaction.reply({
            embeds: [
                __1.client.embeds.error("You don't have permissions to perform an action on the owner."),
            ],
            ephemeral: true,
        });
        return true;
    }
    if (member.roles?.highest.position >= interaction.guild.members.me.roles?.highest.position) {
        interaction.reply({
            embeds: [
                __1.client.embeds.error("I don't have enough permissions to perform this action."),
            ],
            ephemeral: true,
        });
        return true;
    }
    if ((action === PunishmentType_1.PunishmentType.Ban || action === PunishmentType_1.PunishmentType.Softban) && !member.bannable) {
        interaction.reply({
            embeds: [__1.client.embeds.error("This member can't be banned.")],
            ephemeral: true,
        });
        return true;
    }
    if (action === PunishmentType_1.PunishmentType.Kick && !member.kickable) {
        interaction.reply({
            embeds: [__1.client.embeds.error("This member can't be kicked.")],
            ephemeral: true,
        });
        return true;
    }
    if (action === PunishmentType_1.PunishmentType.Timeout && !member.moderatable) {
        interaction.reply({
            embeds: [
                __1.client.embeds.error("This member can't be timed out, most likely because they are an administrator."),
            ],
            ephemeral: true,
        });
        return true;
    }
    if (member.permissions.has('Administrator')) {
        interaction.reply({
            embeds: [__1.client.embeds.error('You can not take actions on an administrator.')],
            ephemeral: true,
        });
        return true;
    }
    if (interaction.member.roles.highest.position <=
        member.roles.highest.position) {
        interaction.reply({
            embeds: [
                __1.client.embeds.error('Your position is not high enough to perform this action.'),
            ],
            ephemeral: true,
        });
        return true;
    }
    return false;
}
exports.ignore = ignore;
