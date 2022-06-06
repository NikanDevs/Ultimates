"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interactions_1 = require("../../interactions");
const Command_1 = require("../../structures/Command");
const fifteenDays = 1000 * 60 * 60 * 24 * 15;
exports.default = new Command_1.Command({
    interaction: interactions_1.interactions.purge,
    excute: async ({ client, interaction, options }) => {
        let amount = Math.round(options.getNumber('amount'));
        const user = options.getUser('user');
        const channel = interaction.channel;
        const fetchMessages = await channel.messages.fetch({
            limit: +amount,
            before: interaction.id,
        });
        let messagesToPurge;
        let descriptionText;
        // Changing the messages that will get cleared
        if (amount) {
            messagesToPurge = fetchMessages.filter((msg) => !msg.pinned && Date.now() + msg.createdTimestamp > fifteenDays);
            descriptionText = `Cleared **${messagesToPurge?.size}** messages in ${channel}`;
        }
        if (user) {
            messagesToPurge = fetchMessages.filter((msg) => msg.author.id === user.id &&
                Date.now() + msg.createdTimestamp > fifteenDays);
            descriptionText = `Cleared **${messagesToPurge?.size}** messages from \`${user?.username}\``;
        }
        // If the purge fails
        if (messagesToPurge.size === 0)
            return interaction.reply({
                embeds: [client.embeds.error('No messages were purged.')],
                ephemeral: true,
            });
        interaction.reply({ embeds: [client.embeds.success(descriptionText)] });
        channel.bulkDelete(messagesToPurge, true);
    },
});
