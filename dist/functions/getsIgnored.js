"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getsIgnored = void 0;
const config_json_1 = require("../json/config.json");
const __1 = require("..");
function getsIgnored(interaction, member) {
    if (member.roles.highest.position >= interaction.guild.me.roles?.highest.position) {
        interaction.reply({
            embeds: [
                __1.client.embeds.error("I don't have enough permissions to perform this action."),
            ],
            ephemeral: true,
        });
        return true;
    }
    else if (member?.roles.highest.position >=
        interaction.member.roles?.highest.position ||
        member.id === config_json_1.ownerId ||
        member.user.bot) {
        interaction.reply({
            embeds: [
                __1.client.embeds.error('You do not have enough permissions to perform this action.'),
            ],
            ephemeral: true,
        });
        return true;
    }
    else
        return false;
}
exports.getsIgnored = getsIgnored;
