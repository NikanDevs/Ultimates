import { EmbedBuilder, InteractionType } from 'discord.js';
import { client } from '../..';
import { configModel } from '../../models/config';
import { Event } from '../../structures/Event';

export default new Event('interactionCreate', async (interaction) => {
	if (interaction.type !== InteractionType.ModalSubmit) return;

	if (interaction.customId === 'add-badwords') {
		const words = interaction.fields.getTextInputValue('input');
		const currentWords = (await configModel.findById('automod')).filteredWords;
		let removed: number = 0;
		const input = words
			.split(',')
			.map((word) => word.trim().toUpperCase())
			.map((word) => {
				if (currentWords.includes(word)) {
					currentWords.splice(currentWords.indexOf(word), 1);
					word = null;
					removed++;
				}
				return word;
			})
			.filter((word) => word);

		await configModel.findByIdAndUpdate('automod', {
			$set: {
				filteredWords: currentWords.concat(input),
			},
		});
		await client.config.updateAutomod();

		await interaction.reply({
			embeds: [
				new EmbedBuilder({
					description: `Added **${input.length}** and removed **${removed}** words.`,
					color: client.cc.successC,
				}),
			],
			ephemeral: true,
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
					color: client.cc.successC,
				}),
			],
			ephemeral: true,
		});
	}
});

