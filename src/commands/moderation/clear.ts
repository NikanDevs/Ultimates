import { Collection, Message, TextChannel } from 'discord.js';
import { t } from 'i18next';
import { guardCollection } from '../../constants';
import { interactions } from '../../interactions';
import { Command } from '../../structures/Command';
const fifteenDays = 1000 * 60 * 60 * 24 * 15;

export default new Command({
	interaction: interactions.clear,
	excute: async ({ client, interaction, options }) => {
		const amount = Math.round(options.getNumber('amount'));
		const user = options.getUser('user');
		const channel = interaction.channel as TextChannel;

		const fetchMessages = await channel.messages.fetch({
			limit: +amount,
			before: interaction.id,
		});
		let messagesToPurge: Collection<string, Message<boolean>>;
		let descriptionText: string;

		// Changing the messages that will get cleared
		if (amount) {
			messagesToPurge = fetchMessages.filter(
				(msg) => !msg.pinned && Date.now() + msg.createdTimestamp > fifteenDays
			);
			descriptionText = t('command.mod.clear.channel', {
				count: messagesToPurge?.size,
				channel: channel.toString(),
			});
		}

		if (user) {
			messagesToPurge = fetchMessages.filter(
				(msg) => msg.author.id === user.id && Date.now() + msg.createdTimestamp > fifteenDays
			);

			descriptionText = t('command.mod.clear.user', {
				count: messagesToPurge?.size,
				user: user.username,
			});
		}

		// If the purge fails
		if (messagesToPurge.size === 0)
			return interaction.reply({
				embeds: [client.embeds.error(t('command.mod.clear.none'))],
				ephemeral: true,
			});

		if (guardCollection.has(`purge:${channel.id}`))
			return interaction.reply({
				embeds: [client.embeds.attention(t('command.mod.clear.purged'))],
				ephemeral: true,
			});

		guardCollection.set(`purge:${channel.id}`, null);
		setTimeout(() => {
			guardCollection.delete(`purge:${channel.id}`);
		}, 7 * 1000);

		interaction.reply({ embeds: [client.embeds.success(descriptionText)], ephemeral: true });
		await channel.bulkDelete(messagesToPurge, true);
	},
});
