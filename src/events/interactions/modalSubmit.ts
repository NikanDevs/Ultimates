import { EmbedBuilder } from 'discord.js';
import { client } from '../..';
import { configModel } from '../../models/config';
import { Event } from '../../structures/Event';

export default new Event('interactionCreate', async (interaction) => {
	if (!interaction.isModalSubmit()) return;

	if (interaction.customId === 'add-badwords') {
		const words = interaction.fields.getTextInputValue('input');
		const currentWords = (await configModel.findById('automod')).filteredWords as string[];
		const removedWords: string[] = [];
		const wordsArray = words
			.split(',')
			.map((word) => {
				if (currentWords.includes(word.trim().toUpperCase())) {
					currentWords.splice(currentWords.indexOf(word.trim().toUpperCase()));
					removedWords.push(word);
					word = null;
				}
				return word !== null ? word?.trim()?.toUpperCase() : 'null';
			})
			.filter((word) => word !== 'null');

		await configModel.findByIdAndUpdate('automod', {
			$set: {
				filteredWords: currentWords.concat(wordsArray),
			},
		});
		await client.config.updateAutomod();

		await interaction.reply({
			embeds: [
				new EmbedBuilder({
					description: [
						wordsArray.length
							? '**Added filtered words:**\n' +
							  wordsArray.join(', ').toLowerCase()
							: '',
						removedWords.length
							? '\n\n**Removed filtered words:**\n' +
							  removedWords.map((word) => word.toLowerCase()).join(', ')
							: '',
					].join('\n'),
					color: client.cc.successC,
				}),
			],
			ephemeral: true,
		});
	}
});

