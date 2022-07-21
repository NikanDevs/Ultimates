import { Colors, EmbedBuilder, InteractionType } from 'discord.js';
import { client } from '../..';
import { MAX_FIELD_VALUE_LENGTH } from '../../constants';
import { splitText } from '../../functions/other/splitText';
import { configModel } from '../../models/config';
import { Event } from '../../structures/Event';

export default new Event('interactionCreate', async (interaction) => {
	if (interaction.type !== InteractionType.ModalSubmit) return;

	if (interaction.customId === 'badwords') {
		if (!interaction.isFromMessage()) return;
		const input = interaction.fields.getTextInputValue('input');
		const newWords = input
			.split(',')
			.map((v) => (v.trim().length ? v.trim().toLowerCase() : null))
			.filter((v) => v);

		await configModel.findByIdAndUpdate('automod', {
			$set: {
				filteredWords: newWords,
			},
		});
		await client.config.updateAutomod();

		await interaction.deferUpdate();
		await interaction.message.edit({
			embeds: [
				EmbedBuilder.from(interaction.message.embeds[0]).spliceFields(0, 1, {
					name: 'Filtered words',
					value: newWords.length
						? splitText(
								newWords.map((w) => `\`${w}\``).join(' '),
								MAX_FIELD_VALUE_LENGTH
						  )
						: 'No filtered words',
				}),
			],
		});
	}

	if (interaction.customId.startsWith('add-reason')) {
		const words = interaction.fields.getTextInputValue('input');
		const module = interaction.customId.replaceAll('add-reason-', '');
		const currentReasons: string[] = (await configModel.findById('moderation')).reasons[
			module
		];
		let removed: number = 0;
		const input = words
			.split('--')
			.map((reason) => reason.trim())
			.map((reason) => {
				// Checking if a reason already exists
				if (currentReasons.includes(reason)) {
					currentReasons.splice(currentReasons.indexOf(reason), 1);
					removed++;
					reason = null;
				}
				return reason;
			})
			.filter((word) => word);

		await configModel.findByIdAndUpdate('moderation', {
			$set: {
				reasons: {
					...(await configModel.findById('moderation')).reasons,
					[module]: currentReasons.concat(input),
				},
			},
		});
		await client.config.updateModeration();

		await interaction.reply({
			embeds: [
				new EmbedBuilder({
					description: `Added **${input.length}** and removed **${removed}** reasons.`,
					color: Colors.Green,
				}),
			],
			ephemeral: true,
		});
	}
});

