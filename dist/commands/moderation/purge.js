"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const purge_1 = require("../../interactions/moderation/purge");
const Command_1 = require("../../structures/Command");
const fifteenDays = 1000 * 60 * 60 * 24 * 15;
exports.default = new Command_1.Command({
    interaction: purge_1.purgeCommand,
    excute: async ({ client, interaction, options }) => {
        let amount = options.getInteger('amount');
        const member = options.getMember('user');
        const channel = interaction.channel;
        if (amount <= 1 || amount > 100 || Math.sign(amount) === -1)
            return interaction.reply({
                embeds: [
                    client.embeds.attention('The amount you want to clear must be a number between `1-100`'),
                ],
                ephemeral: true,
            });
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
        if (member) {
            messagesToPurge = fetchMessages.filter((msg) => msg.author.id === member.id &&
                Date.now() + msg.createdTimestamp > fifteenDays);
            descriptionText = `Cleared **${messagesToPurge?.size}** messages from \`${member?.user.username}\``;
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
