import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, ComponentType } from 'discord.js';
import { t } from 'i18next';
import { client } from '..';
import { guardCollection } from '../constants';
import { ConfirmationOptions } from '../typings';

export async function confirm(interaction: CommandInteraction, options: ConfirmationOptions) {
	if (client.config.general.confirmation) {
		if (guardCollection.has(`confirm:${interaction.commandName}:${interaction.user.id}`))
			return interaction.reply({
				embeds: [client.embeds.error(t('function.sendConfirmation.going'))],
				ephemeral: true,
			});

		const confirmationButtons = new ActionRowBuilder<ButtonBuilder>().addComponents([
			new ButtonBuilder()
				.setCustomId('confirm')
				.setLabel(t('function.sendConfirmation.button.confirm'))
				.setEmoji(client.cc.success)
				.setStyle(ButtonStyle.Secondary),

			new ButtonBuilder()
				.setCustomId('cancel')
				.setLabel(t('function.sendConfirmation.button.cancel'))
				.setEmoji(client.cc.error)
				.setStyle(ButtonStyle.Secondary),
		]);

		const response = await interaction.reply({
			embeds: [
				{
					description: `${client.cc.attention} • ${options.confirmMessage}\n\n${t(
						'function.sendConfirmation.continue'
					)}`,
					color: client.cc.invisible,
				},
			],
			components: [confirmationButtons],
			ephemeral: options.ephemeral,
			fetchReply: true,
		});
		guardCollection.set(`confirm:${interaction.commandName}:${interaction.user.id}`, null);
		setTimeout(() => {
			guardCollection.delete(`confirm:${interaction.commandName}:${interaction.user.id}`);
		}, 15_000);

		const collector = response.createMessageComponentCollector({
			time: 15_000,
			componentType: ComponentType.Button,
		});

		collector.on('collect', async (c) => {
			if (c.user.id !== interaction.user.id) {
				c.reply({ content: t('common.error.cannotInteract'), ephemeral: true });
				return void null;
			}

			collector.stop('success');
			guardCollection.delete(`confirm:${interaction.commandName}:${interaction.user.id}`);

			switch (c.customId) {
				case 'confirm':
					if (options.callback) await options.callback();
					break;
				case 'cancel':
					await interaction.editReply({
						embeds: [
							{
								description: t('function.sendConfirmation.cancelled'),
								color: client.cc.invisible,
							},
						],
						components: [],
					});
					break;
			}
		});

		collector.on('end', (_, reason) => {
			if (reason === 'success') return;

			interaction.editReply({
				embeds: [
					{
						description: t('function.sendConfirmation.timedOut'),
						color: client.cc.invisible,
					},
				],
				components: [],
			});
		});
	} else if (!client.config.general.confirmation) {
		interaction.reply({
			embeds: [
				{
					description: t('function.sendConfirmation.working'),
					color: client.cc.invisible,
				},
			],
			ephemeral: options.ephemeral,
			components: [],
		});
		await options.callback();
	}
}

