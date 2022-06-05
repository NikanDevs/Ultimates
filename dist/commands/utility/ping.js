"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const convertTime_1 = require("../../functions/convertTime");
const interactions_1 = require("../../interactions");
const Command_1 = require("../../structures/Command");
exports.default = new Command_1.Command({
    interaction: interactions_1.interactions.ping,
    excute: async ({ client, interaction }) => {
        const pingEmoji = client.emojis.cache.get('894097855759912970');
        const embed = new discord_js_1.EmbedBuilder()
            .setAuthor({
            name: client.user.username,
            iconURL: client.user.displayAvatarURL(),
        })
            .setColor(client.cc.ultimates)
            .addFields([
            {
                name: `${pingEmoji} Interaction`,
                value: `• \`${Date.now() - interaction.createdTimestamp}ms\``,
                inline: true,
            },
            {
                name: `${pingEmoji} Client`,
                value: `• \`${client.ws.ping}ms\``,
                inline: true,
            },
            {
                name: '🕐 Uptime',
                value: (0, convertTime_1.convertTime)(~~client.uptime),
            },
        ]);
        interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    },
});
