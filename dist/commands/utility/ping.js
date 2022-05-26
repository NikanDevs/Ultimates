"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../structures/Command");
exports.default = new Command_1.Command({
    name: 'ping',
    description: "Check the bot's health.",
    directory: 'utility',
    cooldown: 5000,
    permission: [],
    available: true,
    excute: async ({ client, interaction }) => {
        const pingEmoji = client.emojis.cache.get('894097855759912970');
        const embed = client.util
            .embed()
            .setAuthor({
            name: client.user.username,
            iconURL: client.user.displayAvatarURL(),
        })
            .setColor(client.colors.ultimates)
            .addFields({
            name: `${pingEmoji} Message`,
            value: `• \`${Date.now() - interaction.createdTimestamp}ms\``,
            inline: true,
        }, {
            name: `${pingEmoji} Client`,
            value: `• \`${client.ws.ping}ms\``,
            inline: true,
        }, {
            name: '🕐 Uptime',
            value: client.util.convertTime(~~(client.uptime / 1000), {
                joinWith: '•',
                surrounded: '**',
            }),
        });
        interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    },
});
