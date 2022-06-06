import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	EmbedBuilder,
	Message,
	ModalBuilder,
	TextChannel,
	TextInputStyle,
	Webhook,
} from 'discord.js';
import { WEBHOOK_NAMES } from '../../constants';
import { interactions } from '../../interactions';
import { configModel } from '../../models/config';
import { Command } from '../../structures/Command';
enum logsNames {
	'mod' = 'Moderation Logging',
	'message' = 'Message Logging',
	'modmail' = 'Modmail Logging',
	'servergate' = 'Joins and Leaves',
	'error' = 'Errors Loggings',
}
enum automodModulesNames {
	'badwords' = 'Filtered words',
	'invites' = 'Discord invites',
	'largeMessage' = 'Large messages',
	'massMention' = 'Mass mentions',
	'massEmoji' = 'Mass emoji',
	'spam' = 'Spam',
	'capitals' = 'Too many caps',
	'urls' = 'Urls and links',
}

export default new Command({
	interaction: interactions.configure,
	excute: async ({ client, interaction, options }) => {
		const subcommand = options.getSubcommand();
		await interaction.deferReply({ ephemeral: false });

		if (subcommand === 'logs') {
			const module = options.getString('module') as
				| 'mod'
				| 'modmail'
				| 'message'
				| 'servergate'
				| 'error';

			const channel = options.getChannel('channel') as TextChannel;
			const active = options.getBoolean('active');
			let newWebhook: Webhook;

			const data = await configModel.findById('logging');
			if (!data) {
				const newData = new configModel({
					_id: 'logs',
					logging: {
						mod: { channelId: null, webhook: null, active: null },
						modmail: { channelId: null, webhook: null, active: null },
						message: { channelId: null, webhook: null, active: null },
						servergate: { channelId: null, webhook: null, active: null },
						error: { channelId: null, webhook: null, active: null },
					},
				});
				await newData.save();
			}

			if (channel && channel?.id !== data.logging[module].channelId) {
				switch (module) {
					case 'mod':
						await client.config.webhooks.mod?.delete().catch(() => {});
						break;
					case 'message':
						await client.config.webhooks.message?.delete().catch(() => {});
						break;
					case 'modmail':
						await client.config.webhooks.modmail?.delete().catch(() => {});
						break;
					case 'servergate':
						await client.config.webhooks.servergate?.delete().catch(() => {});
						break;
				}
				newWebhook = await channel.createWebhook(WEBHOOK_NAMES[module], {
					avatar: client.user.displayAvatarURL({ extension: 'png' }),
					reason: '/configure was excuted.',
				});
			}

			if (module && (channel || active !== null)) {
				await configModel.findByIdAndUpdate('logging', {
					$set: {
						logging: {
							[module]: {
								channelId: channel
									? channel.id === data[module].channelId
										? data[module].channelId
										: channel.id
									: data[module].channelId,
								webhook: channel
									? channel.id === data[module].channelId
										? data[module].webhook
										: newWebhook.url
									: data[module].webhook,
								active: active === null ? data[module].active : active,
							},
						},
					},
				});
				await client.config.updateLogs();
			}

			const embed = new EmbedBuilder()
				.setTitle('Logging Configuration')
				.setColor(client.cc.ultimates)
				.addFields([
					await formatLogField('mod'),
					await formatLogField('message'),
					await formatLogField('modmail'),
					await formatLogField('servergate'),
				]);

			await interaction.followUp({ embeds: [embed] });

			// Functions
			async function formatLogField(module: 'mod' | 'message' | 'modmail' | 'servergate') {
				const data = await configModel.findById('logging');
				let channel = (await client.channels
					.fetch(data[module].channelId)
					.catch(() => {})) as TextChannel;
				return {
					name: logsNames[module],
					value: data.logging[module].webhook
						? `${
								data.logging[module].active
									? '<:online:886215547249913856>'
									: '<:offline:906867114126770186>'
						  } • ${channel ? channel : "The logs channel wasn't found."}`
						: '<:idle:906867112612601866> • This module is not set, yet...',
				};
			}
		} else if (subcommand === 'automod') {
			const module = options.getString('module');
			const active = options.getBoolean('active');
			var data = await configModel.findById('automod');
			if (!data) {
				const newData = new configModel({
					_id: 'automod',
					filteredWords: [],
					modules: {
						badwords: false,
						invites: false,
						largeMessage: false,
						massMention: false,
						massEmoji: false,
						spam: false,
						capitals: false,
						urls: false,
					},
				});
				await newData.save();
			}
			data = await configModel.findById('automod');

			if (module && active !== null) {
				await configModel.findByIdAndUpdate('automod', {
					$set: {
						automod: {
							modules: {
								...(await configModel.findById('automod')).modules,
								[module]: active,
							},
						},
					},
				});
				await client.config.updateAutomod();
			}

			const embed = new EmbedBuilder()
				.setTitle('Automod Configuration')
				.setColor(client.cc.ultimates)
				.setDescription(
					[
						await formatDescription('badwords'),
						await formatDescription('invites'),
						await formatDescription('largeMessage'),
						await formatDescription('massMention'),
						await formatDescription('massEmoji'),
						await formatDescription('spam'),
						await formatDescription('capitals'),
						await formatDescription('urls'),
					].join('\n')
				);

			if (data.filteredWords.length)
				embed.addFields([
					{
						name: 'Filtered Words',
						value: client.util.splitText(
							data.filteredWords
								.map((word: string) => word.toLowerCase())
								.join(', '),
							{ splitFor: 'Embed Field Value' }
						),
					},
				]);

			const button = new ActionRowBuilder<ButtonBuilder>().addComponents([
				new ButtonBuilder()
					.setLabel('Add filtered words')
					.setStyle(ButtonStyle.Secondary)
					.setCustomId('badwords'),
			]);

			const sentInteraction = (await interaction.followUp({
				embeds: [embed],
				components: [button],
			})) as Message;

			const collector = sentInteraction.createMessageComponentCollector({
				componentType: ComponentType.Button,
				time: 1000 * 60 * 1,
			});

			collector.on('collect', async (collected): Promise<any> => {
				if (collected.user.id !== interaction.user.id)
					return collected.reply({
						content: 'You can not use this.',
						ephemeral: true,
					});
				if (collected.customId !== 'badwords') return;

				const modal = new ModalBuilder()
					.setTitle('Add filtered words')
					.setCustomId('add-badwords')
					.addComponents([
						{
							type: ComponentType.ActionRow,
							components: [
								{
									type: ComponentType.TextInput,
									custom_id: 'input',
									label: 'Separate words with commas',
									style: TextInputStyle.Paragraph,
									required: true,
									max_length: 4000,
									min_length: 1,
									placeholder:
										'badword1, frick, pizza, cake - type an existing word to remove it',
								},
							],
						},
					]);
				await collected.showModal(modal);
				collector.stop();
			});

			collector.on('end', () => {
				interaction.editReply({ components: [] });
			});

			// Functions
			async function formatDescription(
				module:
					| 'badwords'
					| 'invites'
					| 'largeMessage'
					| 'massMention'
					| 'massEmoji'
					| 'spam'
					| 'capitals'
					| 'urls'
			) {
				const data = await configModel.findById('automod');
				return `${
					data.modules[module]
						? '<:online:886215547249913856>'
						: '<:offline:906867114126770186>'
				} - ${automodModulesNames[module]}`;
			}
		}
	},
});

