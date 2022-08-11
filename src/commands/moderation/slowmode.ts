import { EmbedBuilder, TextChannel } from 'discord.js';
import { t } from 'i18next';
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
									? t('command.mod.slowmode.current', {
											slowmode: convertTime(slowmode * 1000),
									  })
									: t('command.mod.slowmode.none')
							)
							.setColor(client.cc.invisible),
					],
					ephemeral: true,
				});
				break;

			case slowmode:
				await interaction.reply({
					embeds: [client.embeds.attention(t('command.mod.slowmode.same'))],
					ephemeral: true,
				});
				break;

			default:
				await (interaction.channel as TextChannel).setRateLimitPerUser(rate);
				await interaction.reply({
					embeds: [
						client.embeds.success(
							rate !== 0
								? t('command.mod.slowmode.set', {
										context: 'on',
										value: convertTime(rate * 1000),
								  })
								: t('command.mod.slowmode.set', { context: 'off' })
						),
					],
					ephemeral: true,
				});
				break;
		}
	},
});
