import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	EmbedBuilder,
	Formatters,
	Message,
	ModalBuilder,
	SelectMenuBuilder,
	TextChannel,
	TextInputStyle,
	Webhook,
} from 'discord.js';
import {
	MAX_FIELD_VALUE_LENGTH,
	MAX_REASON_LENGTH,
	MAX_SOFTBAN_DURATION,
	MAX_TIMEOUT_DURATION,
	MIN_SOFTBAN_DURATION,
	MIN_TIMEOUT_DURATION,
} from '../../constants';
import { convertTime, convertToTime, isValidTime } from '../../functions/convertTime';
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
enum WEBHOOK_NAMES {
	'mod' = 'Mod-Logs',
	'message' = 'Message-Logs',
	'modmail' = 'Modmail-Logs',
	'servergate' = 'Server Gate',
	'error' = 'Errors',
}

export default new Command({
	interaction: interactions.configure,
	excute: async ({ client, interaction, options }) => {
		const subcommand = options.getSubcommand();
		await interaction.deferReply({ ephemeral: true });

		if (subcommand === 'logs') {
			const module = options.getString('module') as
				| 'mod'
				| 'modmail'
				| 'message'
				| 'servergate';

			const channel = options.getChannel('channel') as TextChannel;
			const active = options.getBoolean('active');
			let newWebhook: Webhook;

			const data = await configModel.findById('logging');
			if (!data) {
				const newData = new configModel({
					_id: 'logging',
					logging: {
						mod: { channelId: null, webhook: null, active: false },
						modmail: { channelId: null, webhook: null, active: false },
						message: { channelId: null, webhook: null, active: false },
						servergate: { channelId: null, webhook: null, active: false },
						error: { channelId: null, webhook: null, active: false },
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
							...(await configModel.findById('logging')).logging,
							[module]: {
								channelId: channel
									? channel.id === data.logging[module].channelId
										? data.logging[module].channelId
										: channel.id
									: data.logging[module].channelId,
								webhook: channel
									? channel.id === data.logging[module].channelId
										? data.logging[module].webhook
										: newWebhook.url
									: data.logging[module].webhook,
								active:
									active === null ? data.logging[module].active : active,
							},
						},
					},
				});
				await client.config.updateLogs();
			}

			if (!module) {
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
			} else {
				const embed = new EmbedBuilder()
					.setColor(client.cc.ultimates)
					.addFields([await formatLogField(module)]);

				await interaction.followUp({ embeds: [embed] });
			}

			// Functions
			async function formatLogField(module: 'mod' | 'message' | 'modmail' | 'servergate') {
				const data = await configModel.findById('logging');
				let channel = (await client.channels
					.fetch(data.logging[module].channelId)
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
			const module = options.getString('module') as
				| 'badwords'
				| 'invites'
				| 'largeMessage'
				| 'massMention'
				| 'massEmoji'
				| 'spam'
				| 'capitals'
				| 'urls';

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
						modules: {
							...(await configModel.findById('automod')).modules,
							[module]: active,
						},
					},
				});
				await client.config.updateAutomod();
			}

			if (!module) {
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
								MAX_FIELD_VALUE_LENGTH
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
			} else {
				const embed = new EmbedBuilder()
					.setColor(client.cc.ultimates)
					.setDescription(await formatDescription(module));

				await interaction.followUp({ embeds: [embed] });
			}

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
		} else if (subcommand === 'general') {
			const module = options.getString('module');
			let value = options.getString('value');

			let data = await configModel.findById('general');
			if (!data) {
				const newData = new configModel({
					_id: 'general',
					ownerId: null,
					developers: [],
					success: '',
					error: '',
					attention: '',
					guild: {
						appealLink: null,
						memberRoleId: null,
						modmailCategoryId: null,
					},
				});
				await newData.save();
			}
			data = await configModel.findById('general');

			if (module && value) {
				if (module === 'developers') {
					const currentDevs = (await configModel.findById('general')).developers;
					if (currentDevs.includes(value)) {
						currentDevs.splice(currentDevs.indexOf(value));
						value = 'null';
					}
					await configModel.findByIdAndUpdate('general', {
						$set: {
							developers: currentDevs.concat(
								[value].filter((value) => value !== 'null')
							),
						},
					});
				} else if (module.startsWith('guild')) {
					await configModel.findByIdAndUpdate('general', {
						$set: {
							guild: {
								...(await configModel.findById('general')).guild,
								[module.replaceAll('guild_', '')]: value,
							},
						},
					});
				} else {
					await configModel.findByIdAndUpdate('general', {
						$set: {
							[module]: value,
						},
					});
				}
				await client.config.updateGeneral();
			}
			data = await configModel.findById('general');

			const embed = new EmbedBuilder()
				.setTitle('General Configuration')
				.setColor(client.cc.ultimates)
				.setDescription(
					[
						`• ${Formatters.bold('Owner')} - ${
							(await client.users.fetch(data.ownerId).catch(() => {})) || '✖︎'
						}`,
						`• ${Formatters.bold('Success')} - ${data.success || '✖︎'}`,
						`• ${Formatters.bold('Error')} - ${data.error || '✖︎'}`,
						`• ${Formatters.bold('Attention')} - ${data.attention || '✖︎'}`,
						`• ${Formatters.bold('Appeal Link')} - ${
							data.guild.appealLink || '✖︎'
						}`,
						`• ${Formatters.bold('Member Role')} - ${
							data.guild.memberRoleId
								? await interaction.guild.roles
										.fetch(data.guild.memberRoleId)
										.catch(() => {})
								: '✖︎'
						}`,
						`• ${Formatters.bold('Modmail Category')} - ${
							data.guild.modmailCategoryId
								? await interaction.guild.channels
										.fetch(data.guild.modmailCategoryId)
										.catch(() => {})
								: '✖︎'
						}`,
						`• ${Formatters.bold('Developers')} - ${
							data.developers.length
								? data.developers
										.map(
											(dev) =>
												`${
													client.users.cache.get(dev)
														?.tag === undefined
														? `Not found, ID: ${dev}`
														: client.users.cache.get(dev)
																?.tag
												}`
										)
										.join(' `|` ')
								: 'No developers.'
						}`,
					].join('\n')
				);

			await interaction.followUp({ embeds: [embed] });
		} else if (subcommand === 'moderation') {
			let module = options.getString('module');
			const value = options.getString('value');

			let data = await configModel.findById('moderation');
			if (!data) {
				const newData = new configModel({
					_id: 'moderation',
					count: { automod: 3, timeout1: 2, timeout2: 4, ban: 6 },
					duration: {
						timeout1: 60 * 60 * 1000,
						timeout2: 2 * 60 * 60 * 100,
						ban: null,
						automod: 60 * 30 * 1000,
					},
					default: {
						timeout: 60 * 60 * 1000,
						softban: 60 * 60 * 24 * 30 * 1000,
						msgs: 0,
						reason: 'No reason was provided.',
					},
					reasons: {
						warn: [],
						timeout: [],
						ban: [],
						softban: [],
						unban: [],
						kick: [],
					},
				});
				await newData.save();
			}
			data = await configModel.findById('moderation');

			if (module && value) {
				// Counts
				if (
					(module.startsWith('count') || module.includes('msgs')) &&
					isNaN(parseInt(value))
				)
					return interaction.followUp({
						embeds: [client.embeds.attention('The input should be a number.')],
					});

				if (
					module.includes('msgs') &&
					(isNaN(parseInt(value)) || parseInt(value) < 0 || parseInt(value) > 7)
				)
					return interaction.followUp({
						embeds: [
							client.embeds.attention('The days must be between 0 and 7.'),
						],
					});

				if (
					!module.startsWith('count') &&
					(module.includes('timeout') || module.includes('automod')) &&
					(!isValidTime(value) ||
						convertToTime(value) > MAX_TIMEOUT_DURATION ||
						convertToTime(value) < MIN_TIMEOUT_DURATION)
				)
					return interaction.followUp({
						embeds: [
							client.embeds.attention(
								`The duration must be between ${convertTime(
									MIN_TIMEOUT_DURATION
								)} and ${convertTime(MAX_TIMEOUT_DURATION)}.`
							),
						],
					});

				if (
					module.startsWith('default') &&
					module.includes('ban') &&
					(!isValidTime(value) ||
						convertToTime(value) > MAX_SOFTBAN_DURATION ||
						convertToTime(value) < MIN_SOFTBAN_DURATION)
				)
					return interaction.followUp({
						embeds: [
							client.embeds.attention(
								`The duration must be between ${convertTime(
									MIN_SOFTBAN_DURATION
								)} and ${convertTime(MAX_SOFTBAN_DURATION)}.`
							),
						],
					});

				if (module.startsWith('count')) {
					module = module.replaceAll('count_', '');
					await configModel.findByIdAndUpdate('moderation', {
						$set: {
							count: {
								...(await configModel.findById('moderation')).count,
								[module]: parseInt(value),
							},
						},
					});
				} else if (module.startsWith('duration')) {
					module = module.replaceAll('duration_', '');
					await configModel.findByIdAndUpdate('moderation', {
						$set: {
							duration: {
								...(await configModel.findById('moderation')).duration,
								[module]:
									module === 'duration_ban'
										? convertToTime(value) === undefined
											? null
											: convertToTime(value)
										: convertToTime(value),
							},
						},
					});
				} else if (module.startsWith('default')) {
					module = module.replaceAll('default_', '');
					await configModel.findByIdAndUpdate('moderation', {
						$set: {
							default: {
								...(await configModel.findById('moderation')).default,
								[module]:
									module === 'reason'
										? client.util.splitText(value, MAX_REASON_LENGTH)
										: module === 'msgs'
										? parseInt(value)
										: convertToTime(value),
							},
						},
					});
				}
				await client.config.updateModeration();
			}

			data = await configModel.findById('moderation');
			const embed = new EmbedBuilder()
				.setTitle('Moderation Configuration')
				.setColor(client.cc.ultimates)
				.setDescription(
					[
						`• ${Formatters.bold('1st timeout warnings count')} - ${
							data.count.timeout1 || '✖︎'
						}`,
						`• ${Formatters.bold('2nd timeout warnings count')} - ${
							data.count.timeout2 || '✖︎'
						}`,
						`• ${Formatters.bold('Ban warnings count')} - ${
							data.count.ban || '✖︎'
						}`,
						`• ${Formatters.bold('Automod timeout warning multiplication')} - ${
							data.count.timeout1 || '✖︎'
						}`,
						`• ${Formatters.bold('1st auto timeout duration ')} - ${
							convertTime(data.duration.timeout1) || '✖︎'
						}`,
						`• ${Formatters.bold('2nd auto timeout duration')} - ${
							convertTime(data.duration.timeout2) || '✖︎'
						}`,
						`• ${Formatters.bold('Auto ban duration')} - ${
							data.duration.ban ? convertTime(data.duration.ban) : 'Permanent'
						}`,
						`• ${Formatters.bold('Automod auto timeout duration')} - ${
							convertTime(data.duration.automod) || '✖︎'
						}`,
						`• ${Formatters.bold('Default timeout duration')} - ${
							convertTime(data.default.timeout) || '✖︎'
						}`,
						`• ${Formatters.bold('Default softban duration')} - ${
							convertTime(data.default.softban) || '✖︎'
						}`,
						`• ${Formatters.bold('Default ban delete msgs duration')} - ${
							!data.default.msgs
								? "don't delete any"
								: `${data.default.msgs} days`
						}`,
						`• ${Formatters.bold('Default punishment reason')} - ${
							data.default.reason || '✖︎'
						}`,
					].join('\n')
				);

			const selectmenu = new ActionRowBuilder<SelectMenuBuilder>().setComponents([
				new SelectMenuBuilder()
					.setCustomId('reasons')
					.setMaxValues(1)
					.setMinValues(1)
					.setPlaceholder('Edit autocomplete reasons for...')
					.setOptions([
						{ label: '/warn', value: 'warn' },
						{ label: '/timeout', value: 'timeout' },
						{ label: '/ban', value: 'ban' },
						{ label: '/softban', value: 'softban' },
						{ label: '/unban', value: 'unban' },
						{ label: '/kick', value: 'kick' },
					]),
			]);

			const sentInteraction = (await interaction.followUp({
				embeds: [embed],
				components: [selectmenu],
			})) as Message;

			const collector = sentInteraction.createMessageComponentCollector({
				componentType: ComponentType.SelectMenu,
				time: 60000,
			});

			collector.on('collect', async (collected): Promise<any> => {
				if (collected.user.id !== interaction.user.id)
					return interaction.reply({
						content: 'You can not use this.',
						ephemeral: true,
					});

				const modal = new ModalBuilder()
					.setTitle('Add reasons')
					.setCustomId('add-reason-' + collected.values)
					.addComponents([
						{
							type: ComponentType.ActionRow,
							components: [
								{
									type: ComponentType.TextInput,
									custom_id: 'input',
									label: 'Separate reasons with --',
									style: TextInputStyle.Paragraph,
									required: true,
									max_length: 4000,
									min_length: 1,
									placeholder:
										'Eating warns, being the imposter - type an existing reason to remove it',
								},
							],
						},
					]);
				await collected.showModal(modal);
			});
		}
	},
});

