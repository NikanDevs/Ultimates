import { EmbedBuilder, TextChannel } from 'discord.js';
import { convertTime } from '../../functions/convertTime';
import { interactions } from '../../interactions';
import { Command } from '../../structures/Command';

export default new Command({
	interaction: interactions.slowmode,
	excute: async ({ client, interaction, options }) => {
		const rate = options.getInteger('rate');
		const slowmode = (interaction.channel as TextChannel).rateLimitPerUser;

		switch (rate) {
			case null:
				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setDescription(
								slowmode !== 0
									? `The current slowmode is **${convertTime(
											slowmode * 1000
									  )}**`
									: "This channel doesn't have any slowmode."
							)
							.setColor(client.cc.invisible),
					],
					ephemeral: true,
				});
				break;

			default:
				if (slowmode === rate)
					return interaction.reply({
						embeds: [
							client.embeds.attention(
								'Providing the current slowmode will not change anything'
							),
						],
						ephemeral: true,
					});

				await (interaction.channel as TextChannel).setRateLimitPerUser(rate);
				await interaction.reply({
					embeds: [
						client.embeds.success(
							rate !== 0
								? `Slowmode was set to **${convertTime(rate * 1000)}**`
								: 'Slowmode was turned off.'
						),
					],
				});
				break;
		}
	},
});

