import { Command } from '../../structures/Command';
import { interactions } from '../../interactions';
import { TextChannel, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { t } from 'i18next';

export default new Command({
	interaction: interactions.verification,
	excute: async ({ client, interaction, options }) => {
		const channel = options.getChannel('channel') as TextChannel;
		const title = options.getString('title') ?? t('command.utility.verification.default', { context: 'title' });
		const description =
			options.getString('description') ??
			t('command.utility.verification.default', { context: 'description' });
		const image = options.getAttachment('image');

		if (!interaction.guild.channels.cache.get(channel.id))
			return interaction.reply({
				embeds: [client.embeds.error(t('command.utility.verification.invalidChannel'))],
				ephemeral: true,
			});

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setColor(client.cc.ultimates)
			.setDescription(description)
			.setImage(image ? image.proxyURL : null);

		const button = new ActionRowBuilder<ButtonBuilder>().setComponents([
			new ButtonBuilder()
				.setLabel(t('command.utility.verification.default', { context: 'button' }))
				.setCustomId('verify')
				.setStyle(ButtonStyle.Primary),
		]);

		channel.send({ embeds: [embed], components: [button] });
		await interaction.reply({
			embeds: [client.embeds.success(t('command.utility.verification.sent', { channel: channel.toString() }))],
			ephemeral: true,
		});
	},
});
