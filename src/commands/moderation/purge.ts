import {
	ApplicationCommandOptionType,
	Collection,
	GuildMember,
	Message,
	TextChannel,
} from 'discord.js';
import { purgeCommand } from '../../interactions/moderation/purge';
import { Command } from '../../structures/Command';
const fifteenDays = 1000 * 60 * 60 * 24 * 15;

export default new Command({
	interaction: purgeCommand,
	excute: async ({ client, interaction, options }) => {
		let amount = options.getInteger('amount');
		const member = options.getMember('user') as GuildMember;
		const channel = interaction.channel as TextChannel;

		if (amount <= 1 || amount > 100 || Math.sign(amount) === -1)
			return interaction.reply({
				embeds: [
					client.embeds.attention(
						'The amount you want to clear must be a number between `1-100`'
					),
				],
				ephemeral: true,
			});

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
			descriptionText = `Cleared **${messagesToPurge?.size}** messages in ${channel}`;
		}
		if (member) {
			messagesToPurge = fetchMessages.filter(
				(msg) =>
					msg.author.id === member.id &&
					Date.now() + msg.createdTimestamp > fifteenDays
			);

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
