"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const convertTime_1 = require("../../functions/convertTime");
const interactions_1 = require("../../interactions");
const Command_1 = require("../../structures/Command");
exports.default = new Command_1.Command({
    interaction: interactions_1.interactions.slowmode,
    excute: async ({ client, interaction, options }) => {
        const rate = options.getInteger('rate');
        const slowmode = interaction.channel.rateLimitPerUser;
        switch (rate) {
            case null:
                await interaction.reply({
                    embeds: [
                        client.util
                            .embed()
                            .setDescription(slowmode !== 0
                            ? `The current slowmode is **${(0, convertTime_1.convertTime)(slowmode * 1000)}**`
                            : "This channel doesn't have any slowmode.")
                            .setColor(client.cc.invisible),
                    ],
                    ephemeral: true,
                });
                break;
            default:
                if (slowmode === rate)
                    return interaction.reply({
                        embeds: [
                            client.embeds.attention('Providing the current slowmode will not change anything'),
                        ],
                        ephemeral: true,
                    });
                await interaction.channel.setRateLimitPerUser(rate);
                await interaction.reply({
                    embeds: [
                        client.util
                            .embed()
                            .setDescription(rate !== 0
                            ? `Slowmode was set to **${(0, convertTime_1.convertTime)(rate * 1000)}**`
                            : 'Slowmode was turned off.')
                            .setColor(client.cc.moderation),
                    ],
                });
                break;
        }
    },
});
