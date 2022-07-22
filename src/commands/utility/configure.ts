import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	EmbedBuilder,
	ModalBuilder,
	SelectMenuBuilder,
	TextInputStyle,
} from 'discord.js';
import { t } from 'i18next';
import { MAX_FIELD_VALUE_LENGTH } from '../../constants';
import { convertTime } from '../../functions/convertTime';
import { splitText } from '../../functions/other/splitText';
import { interactions } from '../../interactions';
import { configModel } from '../../models/config';
import { Command } from '../../structures/Command';
import {
	automodModulesNames,
	loggingModulesNames,
	LoggingModules,
	automodModulesArray,
	AutomodModules,
	automodModuleDescriptions,
	supportedLoggingIgnores,
	loggingModulesArray,
	loggingModuleDescriptions,
	GeneralConfigTypes,
	generalConfigNames,
	generalConfigDescriptions,
	generalConfigArray,
	generalConfigIdType,
	moderationConfigNames,
	ModerationConfigTypes,
	moderationConfigDescriptions,
	moderationConfigArray,
	deleteDayRewites,
	moderationModulesNames,
} from '../../typings';

export default new Command({
	interaction: interactions.configure,
	excute: async ({ client, interaction, options }) => {
		const mainModule = options.getString('module') as 'general' | 'moderation' | 'automod' | 'logs';

		if (mainModule === 'logs') {
			const preSelected: LoggingModules = 'mod';
			const data = await configModel.findById('logging');

			const embed = new EmbedBuilder()
				.setTitle(loggingModulesNames[preSelected])
				.setColor(client.cc.invisible)
				.setDescription(
					[
						`${loggingModuleDescriptions[preSelected]}\n`,
						`\`Channel:\` ${
							data.logging[preSelected].channelId
								? interaction.guild.channels.cache.get(data.logging[preSelected].channelId) ||
								  data.logging[preSelected].channelId
								: 'None'
						}\n`,
						supportedLoggingIgnores.includes(preSelected)
							? `\`Ignores:\`${
									client.config.ignores.logs[preSelected].channelIds.concat(
										client.config.ignores.logs[preSelected].roleIds
									).length
										? `\n${client.config.ignores.logs[preSelected].channelIds
												.map(
													(c: string) =>
														interaction.guild.channels.cache
															.get(c)
															.toString() || c
												)
												.join(' ')} ${client.config.ignores.logs[
												preSelected
										  ].roleIds
												.map(
													(c: string) =>
														interaction.guild.roles.cache.get(c).toString() ||
														c
												)
												.join(' ')}`
										: ' No ignores found'
							  }`
							: '',
					].join('\n')
				);

			const selectMenu = (module: LoggingModules) => {
				return new ActionRowBuilder<SelectMenuBuilder>().setComponents([
					new SelectMenuBuilder().setCustomId('logging:modules').setOptions(
						loggingModulesArray.map((m) => {
							return {
								label: m.rewrite,
								value: m.name,
								default: m.name === module,
							};
						})
					),
				]);
			};

			const buttonComponents = (module: LoggingModules, state: 'enabled' | 'disabled') => {
				const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
					new ButtonBuilder()
						.setLabel(state === 'enabled' ? 'Enabled' : 'Disabled')
						.setStyle(state === 'enabled' ? ButtonStyle.Success : ButtonStyle.Danger)
						.setCustomId(`logging:toggle:${module}`),

					new ButtonBuilder()
						.setLabel('Edit channel')
						.setStyle(ButtonStyle.Secondary)
						.setCustomId(`logging:channel:${module}`)
				);

				if (supportedLoggingIgnores.includes(module))
					row.addComponents(
						new ButtonBuilder()
							.setLabel('Edit ignores')
							.setStyle(ButtonStyle.Secondary)
							.setCustomId(`logging:ignore:${module}`)
					);

				return row;
			};

			const sentInteraction = await interaction.reply({
				embeds: [embed],
				components: [
					selectMenu(preSelected),
					buttonComponents(preSelected, client.config.logging[preSelected] ? 'enabled' : 'disabled'),
				],
			});

			const collector = sentInteraction.createMessageComponentCollector({
				time: 1000 * 60 * 5,
			});

			collector.on('collect', async (collected) => {
				if (collected.user.id !== interaction.user.id) {
					collected.reply({
						content: t('common.errors.cannotInteract'),
						ephemeral: true,
					});
					return void null;
				}

				if (collected.customId === 'logging:modules' && collected.isSelectMenu()) {
					const selectedModule = collected.values[0] as LoggingModules;
					const embed = new EmbedBuilder()
						.setTitle(loggingModulesNames[selectedModule])
						.setColor(client.cc.invisible)
						.setDescription(
							[
								`${loggingModuleDescriptions[selectedModule]}\n`,
								`\`Channel:\` ${
									data.logging[selectedModule].channelId
										? interaction.guild.channels.cache.get(
												data.logging[selectedModule].channelId
										  ) || data.logging[selectedModule].channelId
										: 'None'
								}\n`,
								supportedLoggingIgnores.includes(selectedModule)
									? `\`Ignores:\` ${
											client.config.ignores.logs[selectedModule].channelIds.concat(
												client.config.ignores.logs[selectedModule].roleIds
											).length
												? `\n${client.config.ignores.logs[selectedModule].channelIds
														.map(
															(c: string) =>
																interaction.guild.channels.cache
																	.get(c)
																	.toString() || c
														)
														.join(' ')} ${client.config.ignores.logs[
														selectedModule
												  ].roleIds
														.map(
															(c: string) =>
																interaction.guild.roles.cache
																	.get(c)
																	.toString() || c
														)
														.join(' ')}`
												: 'No ignores found'
									  }`
									: '',
							].join('\n')
						);

					await collected.update({
						embeds: [embed],
						components: [
							selectMenu(selectedModule),
							buttonComponents(
								selectedModule,
								client.config.logging[selectedModule] ? 'enabled' : 'disabled'
							),
						],
					});
				} else if (collected.customId.startsWith('logging:toggle') && collected.isButton()) {
					const module = collected.customId.replace('logging:toggle:', '') as LoggingModules;
					const data = await configModel.findById('logging');

					await configModel.findByIdAndUpdate('logging', {
						$set: {
							logging: {
								...data.logging,
								[module]: {
									...data.logging[module],
									active: !data.logging[module].active,
								},
							},
						},
					});

					await client.config.updateLogs();
					await collected.update({
						components: [
							selectMenu(module),
							buttonComponents(module, client.config.logging[module] ? 'enabled' : 'disabled'),
						],
					});
				} else if (collected.customId.startsWith('logging:channel') && collected.isButton()) {
					const module = collected.customId.replace('logging:channel:', '') as LoggingModules;
					const data = (await configModel.findById('logging')).logging[module];

					const modal = new ModalBuilder()
						.setTitle(`${loggingModulesNames[module]} channel`)
						.setCustomId(`logging:channel:${module}`)
						.addComponents([
							{
								type: ComponentType.ActionRow,
								components: [
									{
										type: ComponentType.TextInput,
										custom_id: 'channelId',
										label: 'Provide the channel id',
										style: TextInputStyle.Short,
										required: false,
										max_length: 18,
										min_length: 18,
										placeholder: 'No channel set, set one!',
										value: data.channelId ?? null,
									},
								],
							},
						]);
					await collected.showModal(modal);
				} else if (collected.customId.startsWith('logging:ignore') && collected.isButton()) {
					const module = collected.customId.replace('logging:ignore:', '') as LoggingModules;

					const modal = new ModalBuilder()
						.setTitle(`${loggingModulesNames[module]} ignores`)
						.setCustomId(`logging:ignores:${module}`)
						.addComponents([
							{
								type: ComponentType.ActionRow,
								components: [
									{
										type: ComponentType.TextInput,
										custom_id: 'channelIds',
										label: 'Ignore channels, separate with spaces',
										style: TextInputStyle.Paragraph,
										required: false,
										max_length: 400,
										min_length: 0,
										placeholder: 'No ignored channel ids, add some!',
										value: client.config.ignores.logs[module].channelIds
											? client.config.ignores.logs[module].channelIds.join(' ')
											: null,
									},
								],
							},
							{
								type: ComponentType.ActionRow,
								components: [
									{
										type: ComponentType.TextInput,
										custom_id: 'roleIds',
										label: 'Ignore roles, separate with spaces',
										style: TextInputStyle.Paragraph,
										required: false,
										max_length: 400,
										min_length: 0,
										placeholder: 'No ignored roles ids, add some!',
										value: client.config.ignores.logs[module].roleIds
											? client.config.ignores.logs[module].roleIds.join(' ')
											: null,
									},
								],
							},
						]);
					await collected.showModal(modal);
				}
			});

			collector.on('end', () => {
				interaction.editReply({ components: [] });
			});
		} else if (mainModule === 'automod') {
			const preSelected: AutomodModules = 'badwords';
			const embed = new EmbedBuilder()
				.setTitle(automodModulesNames[preSelected])
				.setColor(client.cc.invisible)
				.setDescription(
					[
						`${automodModuleDescriptions[preSelected]}\n`,
						`\`Ignores:\` ${
							client.config.ignores.automod[preSelected].channelIds.concat(
								client.config.ignores.automod[preSelected].roleIds
							).length
								? `\n${client.config.ignores.automod[preSelected].channelIds
										.map((c) => interaction.guild.channels.cache.get(c).toString() || c)
										.join(' ')} ${client.config.ignores.automod[preSelected].roleIds
										.map((c) => interaction.guild.roles.cache.get(c).toString() || c)
										.join(' ')}`
								: 'No ignores found'
						}`,
					].join('\n')
				)
				.setFields([
					{
						name: 'Filtered words',
						value: client.config.automod.filteredWords.length
							? splitText(
									client.config.automod.filteredWords.map((w) => `\`${w}\``).join(' '),
									MAX_FIELD_VALUE_LENGTH
							  )
							: 'No filtered words',
					},
				]);

			const selectMenu = (module: AutomodModules) => {
				return new ActionRowBuilder<SelectMenuBuilder>().setComponents([
					new SelectMenuBuilder().setCustomId('automod:modules').setOptions(
						automodModulesArray.map((m) => {
							return {
								label: m.rewrite,
								value: m.name,
								default: m.name === module,
							};
						})
					),
				]);
			};

			const buttonComponents = (module: AutomodModules, state: 'enabled' | 'disabled') => {
				const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
					new ButtonBuilder()
						.setLabel(state === 'enabled' ? 'Enabled' : 'Disabled')
						.setStyle(state === 'enabled' ? ButtonStyle.Success : ButtonStyle.Danger)
						.setCustomId(`automod:toggle:${module}`),

					new ButtonBuilder()
						.setLabel('Edit ignores')
						.setStyle(ButtonStyle.Secondary)
						.setCustomId(`automod:ignore:${module}`)
				);

				if (module === 'badwords')
					row.addComponents(
						new ButtonBuilder()
							.setLabel('Edit filtered words')
							.setStyle(ButtonStyle.Secondary)
							.setCustomId(`automod:badwords`)
					);

				return row;
			};

			const sentInteraction = await interaction.reply({
				embeds: [embed],
				components: [
					selectMenu(preSelected),
					buttonComponents(
						preSelected,
						client.config.automod.modules[preSelected] ? 'enabled' : 'disabled'
					),
				],
			});

			const collector = sentInteraction.createMessageComponentCollector({
				time: 1000 * 60 * 5,
			});

			collector.on('collect', async (collected) => {
				if (collected.user.id !== interaction.user.id) {
					collected.reply({
						content: t('common.errors.cannotInteract'),
						ephemeral: true,
					});
					return void null;
				}

				if (collected.customId === 'automod:modules' && collected.isSelectMenu()) {
					const selectedModule = collected.values[0] as AutomodModules;
					const embed = new EmbedBuilder()
						.setTitle(automodModulesNames[selectedModule])
						.setColor(client.cc.invisible)
						.setDescription(
							[
								`${automodModuleDescriptions[selectedModule]}\n`,
								`\`Ignores:\` ${
									client.config.ignores.automod[selectedModule].channelIds.concat(
										client.config.ignores.automod[selectedModule].roleIds
									).length
										? `\n${client.config.ignores.automod[selectedModule].channelIds
												.map((c) =>
													interaction.guild.channels.cache.get(c).toString()
												)
												.join(' ')} ${client.config.ignores.automod[
												selectedModule
										  ].roleIds
												.map((c) => interaction.guild.roles.cache.get(c).toString())
												.join(' ')}`
										: 'No ignores found'
								}`,
							].join('\n')
						);

					if (selectedModule === 'badwords')
						embed.setFields([
							{
								name: 'Filtered words',
								value: client.config.automod.filteredWords.length
									? splitText(
											client.config.automod.filteredWords
												.map((w) => `\`${w}\``)
												.join(' '),
											MAX_FIELD_VALUE_LENGTH
									  )
									: 'No filtered words',
							},
						]);

					await collected.update({
						embeds: [embed],
						components: [
							selectMenu(selectedModule),
							buttonComponents(
								selectedModule,
								client.config.automod.modules[selectedModule] ? 'enabled' : 'disabled'
							),
						],
					});
				} else if (collected.customId.startsWith('automod:toggle') && collected.isButton()) {
					const module = collected.customId.replace('automod:toggle:', '') as AutomodModules;
					const data = await configModel.findById('automod');

					await configModel.findByIdAndUpdate('automod', {
						$set: {
							modules: { ...data.modules, [module]: !data.modules[module] },
						},
					});

					await client.config.updateAutomod();
					await collected.update({
						components: [
							selectMenu(module),
							buttonComponents(
								module,
								client.config.automod.modules[module] ? 'enabled' : 'disabled'
							),
						],
					});
				} else if (collected.customId.startsWith('automod:ignore') && collected.isButton()) {
					const module = collected.customId.replace('automod:ignore:', '') as AutomodModules;

					const modal = new ModalBuilder()
						.setTitle(`${automodModulesNames[module]} ignores`)
						.setCustomId(`automod:ignores:${module}`)
						.addComponents([
							{
								type: ComponentType.ActionRow,
								components: [
									{
										type: ComponentType.TextInput,
										custom_id: 'channelIds',
										label: 'Ignore channels, separate with spaces',
										style: TextInputStyle.Paragraph,
										required: false,
										max_length: 400,
										min_length: 0,
										placeholder: 'No ignored channel ids, add some!',
										value: client.config.ignores.automod[module].channelIds
											? client.config.ignores.automod[module].channelIds.join(' ')
											: null,
									},
								],
							},
							{
								type: ComponentType.ActionRow,
								components: [
									{
										type: ComponentType.TextInput,
										custom_id: 'roleIds',
										label: 'Ignore roles, separate with spaces',
										style: TextInputStyle.Paragraph,
										required: false,
										max_length: 400,
										min_length: 0,
										placeholder: 'No ignored roles ids, add some!',
										value: client.config.ignores.automod[module].roleIds
											? client.config.ignores.automod[module].roleIds.join(' ')
											: null,
									},
								],
							},
						]);
					await collected.showModal(modal);
				} else if (collected.customId == 'automod:badwords' && collected.isButton()) {
					const modal = new ModalBuilder()
						.setTitle('Filtered Words')
						.setCustomId('badwords')
						.addComponents([
							{
								type: ComponentType.ActionRow,
								components: [
									{
										type: ComponentType.TextInput,
										custom_id: 'input',
										label: 'Separate them with commas',
										style: TextInputStyle.Paragraph,
										required: false,
										max_length: 500,
										min_length: 0,
										placeholder: 'No filtered words, add some!',
										value: client.config.automod.filteredWords.length
											? client.config.automod.filteredWords.join(', ')
											: null,
									},
								],
							},
						]);
					await collected.showModal(modal);
				}
			});

			collector.on('end', () => {
				interaction.editReply({ components: [] });
			});
		} else if (mainModule === 'general') {
			const preSelected: GeneralConfigTypes = 'developers';
			const embed = new EmbedBuilder()
				.setTitle(generalConfigNames[preSelected])
				.setColor(client.cc.invisible)
				.setDescription(
					`${generalConfigDescriptions[preSelected]}\n\n\`Current:\` ${
						client.config.general[preSelected].length
							? client.config.general[preSelected]
									.map((d) => client.users.cache.get(d)?.tag || d)
									.join(' | ')
							: 'None'
					}`
				);

			const selectMenu = (module: GeneralConfigTypes) => {
				return new ActionRowBuilder<SelectMenuBuilder>().setComponents([
					new SelectMenuBuilder().setCustomId('general:modules').setOptions(
						generalConfigArray.map((m) => {
							return {
								label: m.rewrite,
								value: m.name,
								default: m.name === module,
							};
						})
					),
				]);
			};

			const buttonComponents = (module: GeneralConfigTypes) => {
				return new ActionRowBuilder<ButtonBuilder>().setComponents(
					new ButtonBuilder()
						.setLabel('Edit')
						.setStyle(ButtonStyle.Secondary)
						.setCustomId(`general:${module}`)
				);
			};

			const sentInteraction = await interaction.reply({
				embeds: [embed],
				components: [selectMenu(preSelected), buttonComponents(preSelected)],
			});

			const collector = sentInteraction.createMessageComponentCollector({
				time: 1000 * 60 * 5,
			});

			collector.on('collect', async (collected) => {
				if (collected.user.id !== interaction.user.id) {
					collected.reply({
						content: t('common.errors.cannotInteract'),
						ephemeral: true,
					});
					return void null;
				}

				if (collected.customId === 'general:modules' && collected.isSelectMenu()) {
					const selectedModule = collected.values[0] as GeneralConfigTypes;
					const embed = new EmbedBuilder()
						.setTitle(generalConfigNames[selectedModule])
						.setColor(client.cc.invisible)
						.setDescription(
							`${generalConfigDescriptions[selectedModule]}\n\n\`Current:\` ${
								selectedModule === 'memberRoleId'
									? client.config.general.memberRoleId
										? interaction.guild.roles.cache
												.get(client.config.general.memberRoleId)
												?.toString() || client.config.general.memberRoleId
										: 'None'
									: selectedModule === 'modmailCategoryId'
									? client.config.general.modmailCategoryId
										? interaction.guild.channels.cache
												.get(client.config.general.modmailCategoryId)
												?.toString() || client.config.general.modmailCategoryId
										: 'None'
									: selectedModule === 'developers'
									? client.config.general.developers.length
										? client.config.general.developers
												.map((u) => client.users.cache.get(u)?.tag || u)
												.join(' | ')
										: 'None'
									: client.config.general[selectedModule] ?? 'None'
							}`
						);

					await collected.update({
						embeds: [embed],
						components: [selectMenu(selectedModule), buttonComponents(selectedModule)],
					});
				} else if (collected.customId.startsWith('general:')) {
					const module = collected.customId.replace('general:', '') as GeneralConfigTypes;
					const modal = new ModalBuilder()
						.setTitle(`${generalConfigNames[module]}`)
						.setCustomId(`general:${module}`)
						.addComponents([
							{
								type: ComponentType.ActionRow,
								components: [
									{
										type: ComponentType.TextInput,
										custom_id: 'input',
										label:
											generalConfigNames[module] +
											`${module === 'developers' ? ' (separate with spaces)' : ''}`,
										style: generalConfigIdType.includes(module)
											? TextInputStyle.Short
											: TextInputStyle.Paragraph,
										required: false,
										max_length: generalConfigIdType.includes(module) ? 18 : 400,
										min_length: generalConfigIdType.includes(module) ? 18 : 0,
										placeholder: 'LLLpo',
										value:
											module === 'developers'
												? client.config.general[module].join(' ')
												: client.config.general[module],
									},
								],
							},
						]);
					await collected.showModal(modal);
				}
			});

			collector.on('end', () => {
				interaction.editReply({ components: [] });
			});
		} else if (mainModule === 'moderation') {
			const preSelected: ModerationConfigTypes = 'counts';
			const embed = new EmbedBuilder()
				.setTitle(moderationConfigNames[preSelected])
				.setColor(client.cc.invisible)
				.setDescription(
					[
						`${moderationConfigDescriptions[preSelected]}\n`,
						`\`Timeout #1:\` ${client.config.moderation[preSelected].timeout1}`,
						`\`Timeout #2:\` ${client.config.moderation[preSelected].timeout2}`,
						`\`Ban:\` ${client.config.moderation[preSelected].ban}`,
						`\`Automod multiplication:\` ${client.config.moderation[preSelected].automod}`,
					].join('\n')
				);

			const selectMenu = (module: ModerationConfigTypes) => {
				return new ActionRowBuilder<SelectMenuBuilder>().addComponents([
					new SelectMenuBuilder().setCustomId('moderation:modules').setOptions(
						moderationConfigArray.map((m) => {
							return {
								label: m.rewrite,
								value: m.name,
								default: m.name === module,
							};
						})
					),
				]);
			};

			const buttonComponents = (module: ModerationConfigTypes) => {
				const row = new ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>();

				if (module === 'counts')
					row.setComponents([
						new ButtonBuilder()
							.setLabel('Timeout #1')
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:counts:timeout1'),
						new ButtonBuilder()
							.setLabel('Timeout #2')
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:counts:timeout2'),
						new ButtonBuilder()
							.setLabel('Ban')
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:counts:ban'),
						new ButtonBuilder()
							.setLabel('Automod')
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:counts:automod'),
					]);

				if (module === 'durations')
					row.setComponents([
						new ButtonBuilder()
							.setLabel('Timeout #1')
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:durations:timeout1'),
						new ButtonBuilder()
							.setLabel('Timeout #2')
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:durations:timeout2'),
						new ButtonBuilder()
							.setLabel('Ban')
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:durations:ban'),
						new ButtonBuilder()
							.setLabel('Automod')
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:durations:automod'),
					]);

				if (module === 'durations')
					row.setComponents([
						new ButtonBuilder()
							.setLabel('Timeout #1')
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:durations:timeout1'),
						new ButtonBuilder()
							.setLabel('Timeout #2')
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:durations:timeout2'),
						new ButtonBuilder()
							.setLabel('Ban')
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:durations:ban'),
						new ButtonBuilder()
							.setLabel('Automod')
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:durations:automod'),
					]);

				if (module === 'defaults')
					row.setComponents([
						new ButtonBuilder()
							.setLabel('Timeout duration')
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:defaults:timeout'),
						new ButtonBuilder()
							.setLabel('Softban duration')
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:defaults:softban'),
						new ButtonBuilder()
							.setLabel('Delete messages days')
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:defaults:msgs'),
					]);

				if (module === 'reasons')
					row.setComponents(
						new SelectMenuBuilder()
							.setCustomId('moderation:reasons')
							.setMaxValues(1)
							.setMinValues(0)
							.setPlaceholder('Edit autocomplete reasons for...')
							.setOptions([
								{ label: '/warn', value: 'warn' },
								{ label: '/timeout', value: 'timeout' },
								{ label: '/ban', value: 'ban' },
								{ label: '/softban', value: 'softban' },
								{ label: '/unban', value: 'unban' },
								{ label: '/kick', value: 'kick' },
							])
					);

				return row;
			};

			const sentInteraction = await interaction.reply({
				embeds: [embed],
				components: [selectMenu(preSelected), buttonComponents(preSelected)],
			});

			const collector = sentInteraction.createMessageComponentCollector({
				time: 1000 * 60 * 5,
			});

			collector.on('collect', async (collected) => {
				if (collected.user.id !== interaction.user.id) {
					collected.reply({
						content: t('common.errors.cannotInteract'),
						ephemeral: true,
					});
					return void null;
				}

				if (collected.customId === 'moderation:modules' && collected.isSelectMenu()) {
					const selectedModule = collected.values[0] as ModerationConfigTypes;
					const embed = new EmbedBuilder()
						.setTitle(moderationConfigNames[selectedModule])
						.setColor(client.cc.invisible)
						.setDescription(
							[
								`${moderationConfigDescriptions[selectedModule]}\n`,
								selectedModule === 'counts'
									? [
											`\`Timeout #1:\` ${client.config.moderation[selectedModule].timeout1}`,
											`\`Timeout #2:\` ${client.config.moderation[selectedModule].timeout2}`,
											`\`Ban:\` ${client.config.moderation[selectedModule].ban}`,
											`\`Automod multiplication:\` ${client.config.moderation[selectedModule].automod}`,
									  ].join('\n')
									: selectedModule === 'durations'
									? [
											`\`Timeout #1:\` ${convertTime(
												client.config.moderation[selectedModule].timeout1
											)}`,
											`\`Timeout #2:\` ${convertTime(
												client.config.moderation[selectedModule].timeout2
											)}`,
											`\`Ban:\` ${
												client.config.moderation[selectedModule].ban
													? convertTime(
															client.config.moderation[selectedModule].ban
													  )
													: 'Permanent'
											}`,
											`\`Automod timeout:\` ${convertTime(
												client.config.moderation[selectedModule].automod
											)}`,
									  ].join('\n')
									: selectedModule === 'defaults'
									? [
											`\`Timeout duration:\` ${convertTime(
												client.config.moderation[selectedModule].timeout
											)}`,
											`\`Softban duration:\` ${convertTime(
												client.config.moderation[selectedModule].softban
											)}`,
											`\`Delete message days:\` ${
												deleteDayRewites[
													client.config.moderation[selectedModule].msgs
												]
											}`,
									  ].join('\n')
									: '',
							].join('\n')
						);

					await collected.update({
						embeds: [embed],
						components: [selectMenu(selectedModule), buttonComponents(selectedModule)],
					});
				} else if (collected.customId === 'moderation:reasons' && collected.isSelectMenu()) {
					const modal = new ModalBuilder()
						.setTitle(`Reasons for ${collected.values[0]}`)
						.setCustomId(`moderation:reasons:${collected.values[0]}`)
						.addComponents([
							{
								type: ComponentType.ActionRow,
								components: [
									{
										type: ComponentType.TextInput,
										custom_id: 'reasons',
										label: 'Separate reasons with ||',
										style: TextInputStyle.Paragraph,
										required: false,
										max_length: 4000,
										min_length: 0,
										placeholder: 'No reasons, add some!',
										value: client.config.moderation.reasons[collected.values[0]].length
											? client.config.moderation.reasons[collected.values[0]].join(
													' || '
											  )
											: null,
									},
								],
							},
						]);
					await collected.showModal(modal);
				} else if (collected.customId.startsWith('moderation:') && collected.isButton()) {
					const subModule = collected.customId.split(':')[1] as ModerationConfigTypes;
					const module = collected.customId.split(':')[2];
					const modal = new ModalBuilder()
						.setTitle(
							`${moderationConfigNames[subModule]} - ${moderationModulesNames[subModule][module]}`
						)
						.setCustomId(`moderation:${subModule}:${module}`)
						.addComponents([
							{
								type: ComponentType.ActionRow,
								components: [
									{
										type: ComponentType.TextInput,
										custom_id: 'input',
										label: `${moderationConfigNames[subModule]} - ${moderationModulesNames[subModule][module]}`,
										style: TextInputStyle.Short,
										required: true,
										max_length: 100,
										min_length: 1,
										value:
											subModule === 'durations'
												? client.config.moderation[subModule][module]
													? convertTime(
															client.config.moderation[subModule][module]
													  )
													: 'Permanent'
												: subModule === 'defaults'
												? module === 'msgs'
													? client.config.moderation[subModule][module]
													: convertTime(
															client.config.moderation[subModule][module]
													  )
												: client.config.moderation[subModule][module],
									},
								],
							},
						]);
					await collected.showModal(modal);
				}
			});

			collector.on('end', () => {
				interaction.editReply({ components: [] });
			});
		}
	},
});
