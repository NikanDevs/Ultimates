import { Command } from '../../structures/Command';
import { interactions } from '../../interactions';
import { TextChannel, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default new Command({
	interaction: interactions.verification,
	excute: async ({ client, interaction, options }) => {
		const channel = options.getChannel('channel') as TextChannel;
		const title = options.getString('title') ?? 'Verification Required';
		const description =
			options.getString('description') ??
			"This server requires verification before you can view all the channels and be a part of the server. You prove that you're a human by verifying.\n\n• Click the button below and get started!";
		const image = options.getAttachment('image');

		if (!interaction.guild.channels.cache.get(channel.id))
			return interaction.reply({
				embeds: [client.embeds.error('The channel should be in this server.')],
				ephemeral: true,
			});

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setColor(client.cc.ultimates)
			.setDescription(description)
			.setImage(image ? image.proxyURL : null);

		const button = new ActionRowBuilder<ButtonBuilder>().setComponents([
			new ButtonBuilder().setLabel('Verify').setCustomId('verify').setStyle(ButtonStyle.Primary),
		]);

		channel.send({ embeds: [embed], components: [button] });
		await interaction.reply({
			embeds: [client.embeds.success('The verification embed was sent.')],
			ephemeral: true,
		});
	},
});
