"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const mongoose_1 = require("mongoose");
const interactions_1 = require("../../interactions");
const Command_1 = require("../../structures/Command");
exports.default = new Command_1.Command({
    interaction: interactions_1.interactions.ping,
    excute: async ({ client, interaction }) => {
        const embed = new discord_js_1.EmbedBuilder()
            .setAuthor({
            name: client.user.username,
            iconURL: client.user.displayAvatarURL(),
        })
            .setColor(client.cc.ultimates)
            .setDescription([
            `${pingEmoji(client.ws.ping)} **Websocket** - ${client.ws.ping}ms`,
            `${pingEmoji(Date.now() - interaction.createdTimestamp)} **Roundtrip** - ${Date.now() - interaction.createdTimestamp}ms`,
            `<:mongoDB:983328317929316392> **MongoDB** - ${client.util.capitalize(mongoose_1.ConnectionStates[mongoose_1.connection.readyState])}`,
        ].join('\n'));
        interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
        function pingEmoji(value) {
            if (value > 300) {
                return '<:pingB:983330298924269589>';
            }
            else if (value > 150) {
                return '<:pingM:983330301692510248>';
            }
            else {
                return '<:pingE:983330296831283230> ';
            }
        }
    },
});
