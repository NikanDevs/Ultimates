import { Colors, EmbedBuilder, GuildMember, InteractionType } from 'discord.js';
import { client } from '../..';
import { verificationCollection } from '../../constants';
import { Event } from '../../structures/Event';

export default new Event('interactionCreate', async (interaction) => {
	if (interaction.type !== InteractionType.ModalSubmit) return;

	if (interaction.customId === 'verification:modal-' + interaction.user.id) {
		const answer = verificationCollection.get('modal:answer-' + interaction.user.id);
		const getValue = interaction.fields.getTextInputValue('answer');

		if (!answer)
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor(Colors.Red)
						.setDescription('Looks like your time has ended to submit an answer.'),
				],
				ephemeral: true,
			});

		if (getValue === answer) {
			(interaction.member as GuildMember).roles.add(client.config.general.memberRoleId);
			interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor(Colors.Green)
						.setDescription('Congrats! You were verified in the server.'),
				],
				ephemeral: true,
			});

			verificationCollection.delete('cooldown-' + interaction.user.id);
			verificationCollection.delete('modal:answer-' + interaction.user.id);
		} else if (getValue !== answer) {
			const deniedEmbed = new EmbedBuilder()
				.setColor(Colors.Red)
				.setDescription("Whoops, your answer wasn't correct. Try again to get verified.");

			interaction.reply({ embeds: [deniedEmbed], ephemeral: true });
		}
		verificationCollection.delete('modal:answer-' + interaction.user.id);
	}
});
