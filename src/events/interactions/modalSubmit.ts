import { EmbedBuilder } from 'discord.js';
import { client } from '../..';
import { configModel } from '../../models/config';
import { Event } from '../../structures/Event';

export default new Event('interactionCreate', async (interaction) => {
	if (!interaction.isModalSubmit()) return;

	if (interaction.customId === 'add-badwords') {
		const words = interaction.fields.getTextInputValue('input');
		const currentWords = (await configModel.findById('automod')).filteredWords as string[];
		const removed: string[] = [];
		const input = words
			.split(',')
			.map((word) => {
				if (currentWords.includes(word.trim().toUpperCase())) {
					currentWords.splice(currentWords.indexOf(word.trim().toUpperCase()));
					removed.push(word);
					word = null;
				}
				return word !== null ? word?.trim()?.toUpperCase() : 'null';
			})
			.filter((word) => word !== 'null');

		await configModel.findByIdAndUpdate('automod', {
			$set: {
				filteredWords: currentWords.concat(input),
			},
		});
		await client.config.updateAutomod();

		await interaction.reply({
			embeds: [
				new EmbedBuilder({
					description: [
						input.length
							? '**Added filtered words:**\n' + input.join(', ').toLowerCase()
							: '',
						removed.length
							? '\n\n**Removed filtered words:**\n' +
							  removed.map((word) => word.toLowerCase()).join(', ')
							: '',
					].join('\n'),
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
		const removed: string[] = [];
		const input = words
			.split('--')
			.map((reason) => {
				if (currentReasons.includes(reason.trim().toUpperCase())) {
					currentReasons
						.map((r) => r.toUpperCase())
						.splice(currentReasons.indexOf(reason.trim().toUpperCase()));
					removed.push(reason);
					reason = null;
				}
				return reason !== null ? reason?.trim() : 'null';
			})
			.filter((word) => word !== 'null');

		await configModel.findByIdAndUpdate('moderation', {
			$set: {
				reasons: {
					[module]: currentReasons.concat(input),
				},
			},
		});
		await client.config.updateModeration();

		await interaction.reply({
			embeds: [
				new EmbedBuilder({
					description: [
						input.length
							? '**Added reasons:**\n' + input.join('\n').toLowerCase()
							: '',
						removed.length
							? '\n\n**Removed reasons:**\n' +
							  removed.map((word) => word.toLowerCase()).join('\n')
							: '',
					].join('\n'),
					color: client.cc.successC,
				}),
			],
			ephemeral: true,
		});
	}
});

