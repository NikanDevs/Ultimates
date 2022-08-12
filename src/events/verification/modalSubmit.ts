import { Colors, EmbedBuilder, GuildMember, InteractionType } from 'discord.js';
import { t } from 'i18next';
import { client } from '../..';
import { verificationCollection } from '../../constants';
import { Event } from '../../structures/Event';

export default new Event('interactionCreate', async (interaction) => {
	if (interaction.type !== InteractionType.ModalSubmit) return;

	if (interaction.customId === 'verification:modal-' + interaction.user.id) {
		const answer = verificationCollection.get(`modal:${interaction.user.id}`);
		const getValue = interaction.fields.getTextInputValue('answer');

		if (!answer)
			return interaction.reply({
				embeds: [
					new EmbedBuilder().setColor(Colors.Red).setDescription(t('event.verification.modal.timeout')),
				],
				ephemeral: true,
			});

		if (getValue === answer) {
			(interaction.member as GuildMember).roles.add(client.config.general.memberRoleId);
			interaction.reply({
				embeds: [new EmbedBuilder().setColor(Colors.Green).setDescription(t('event.verification.correct'))],
				ephemeral: true,
			});

			verificationCollection.delete(`cooldown:${interaction.user.id}`);
			verificationCollection.delete(`modal:${interaction.user.id}`);
		} else if (getValue !== answer) {
			const deniedEmbed = new EmbedBuilder()
				.setColor(Colors.Red)
				.setDescription(t('event.verification.incorrect'));

			interaction.reply({ embeds: [deniedEmbed], ephemeral: true });
		}
		verificationCollection.delete(`modal:${interaction.user.id}`);
	}
});
