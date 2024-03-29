import {
	ActionRowBuilder,
	AnyThreadChannel,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	EmbedBuilder,
	ForumChannel,
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
	LoggingModules,
	AutomodModules,
	supportedLoggingIgnores,
	GeneralConfigTypes,
	generalConfigIdType,
	ModerationConfigTypes,
	Emojis,
} from '../../typings';

export default new Command({
	interaction: interactions.configure,
	excute: async ({ client, interaction, options }) => {
		const mainModule = options.getString('module') as 'general' | 'moderation' | 'automod' | 'logs';

		if (mainModule === 'logs') {
			const preSelected: LoggingModules = 'base';
			const data = await configModel.findById('logging');

			const embed = new EmbedBuilder()
				.setTitle(t(`command.utility.configure.logs.enum.${preSelected}`, { context: 'name' }))
				.setColor(client.cc.invisible)
				.setDescription(
					[
						t('command.utility.configure.logs.enum.' + preSelected, {
							context: 'description',
						}),
						t('command.utility.configure.logs.channel', {
							channel: data.logging[preSelected].channelId
								? interaction.guild.channels.cache
										.get(data.logging[preSelected].channelId)
										?.toString() || data.logging[preSelected].channelId
								: t('command.utility.configure.none'),
						}),
					].join('\n\n')
				);

			const selectMenu = (module: LoggingModules) => {
				return new ActionRowBuilder<SelectMenuBuilder>().setComponents([
					new SelectMenuBuilder().setCustomId('logging:modules').setOptions([
						{
							label: t('command.utility.configure.logs.enum.base', { context: 'name' }),
							value: 'base',
							default: 'base' === module,
						},
						{
							label: t('command.utility.configure.logs.enum.mod', { context: 'name' }),
							value: 'mod',
							default: 'mod' === module,
						},
						{
							label: t('command.utility.configure.logs.enum.message', { context: 'name' }),
							value: 'message',
							default: 'message' === module,
						},
						{
							label: t('command.utility.configure.logs.enum.modmail', { context: 'name' }),
							value: 'modmail',
							default: 'modmail' === module,
						},
						{
							label: t('command.utility.configure.logs.enum.servergate', { context: 'name' }),
							value: 'servergate',
							default: 'servergate' === module,
						},
						{
							label: t('command.utility.configure.logs.enum.voice', { context: 'name' }),
							value: 'voice',
							default: 'voice' === module,
						},
					]),
				]);
			};

			const buttonComponents = (module: LoggingModules, state: 'enabled' | 'disabled') => {
				const row = new ActionRowBuilder<ButtonBuilder>().setComponents([]);

				if (module !== 'base')
					row.addComponents(
						new ButtonBuilder()
							.setLabel(
								state === 'enabled'
									? t('command.utility.configure.logs.button.disable')
									: t('command.utility.configure.logs.button.enable')
							)
							.setStyle(state === 'enabled' ? ButtonStyle.Danger : ButtonStyle.Success)
							.setCustomId(`logging:toggle:${module}`)
					);

				row.addComponents(
					module === 'base'
						? new ButtonBuilder()
								.setLabel(t('command.utility.configure.logs.button.editChannel'))
								.setStyle(ButtonStyle.Secondary)
								.setCustomId(`logging:channel:${module}`)
						: data.logging[module].channelId
						? new ButtonBuilder()
								.setLabel(t('command.utility.configure.logs.button.deleteChannel'))
								.setStyle(ButtonStyle.Danger)
								.setCustomId(`logging:channel:${module}`)
						: new ButtonBuilder()
								.setLabel(t('command.utility.configure.logs.button.createChannel'))
								.setStyle(ButtonStyle.Success)
								.setCustomId(`logging:channel:${module}`)
				);

				if (supportedLoggingIgnores.includes(module))
					row.addComponents(
						new ButtonBuilder()
							.setLabel(t('command.utility.configure.logs.button.editIgnores'))
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
						.setTitle(t(`command.utility.configure.logs.enum.${selectedModule}`, { context: 'name' }))
						.setColor(client.cc.invisible)
						.setDescription(
							[
								t('command.utility.configure.logs.enum.' + selectedModule, {
									context: 'description',
								}),
								t('command.utility.configure.logs.channel', {
									channel: data.logging[selectedModule].channelId
										? interaction.guild.channels.cache
												.get(data.logging[selectedModule].channelId)
												?.toString() || data.logging[selectedModule].channelId
										: t('command.utility.configure.none'),
								}),
								supportedLoggingIgnores.includes(selectedModule)
									? t('command.utility.configure.logs.ignores', {
											ignores: client.config.ignores.logs[
												selectedModule
											].channelIds.concat(
												client.config.ignores.logs[selectedModule].roleIds
											).length
												? `\n${client.config.ignores.logs[selectedModule].channelIds
														.map(
															(c: string) =>
																interaction.guild.channels.cache
																	.get(c)
																	?.toString() || c
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
												: t('command.utility.configure.none'),
									  })
									: '',
							].join('\n\n')
						);

					await collected.update({
						embeds: [embed],
						components: [
							selectMenu(selectedModule),
							buttonComponents(
								selectedModule,
								client.config.logging[selectedModule]?.active ? 'enabled' : 'disabled'
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
							buttonComponents(
								module,
								client.config.logging[module].active ? 'enabled' : 'disabled'
							),
						],
					});
				} else if (collected.customId.startsWith('logging:channel') && collected.isButton()) {
					const module = collected.customId.replace('logging:channel:', '') as LoggingModules;
					let db = await configModel.findById('logging');
					const data = db.logging[module];

					if (!db.logging.base.channelId && module !== 'base') {
						collected.reply({
							embeds: [client.embeds.attention(t('command.utility.configure.logs.noBase'))],
							ephemeral: true,
						});
						return;
					}

					if (module === 'base') {
						const modal = new ModalBuilder()
							.setTitle(
								t(`command.utility.configure.logs.enum.${module}`, {
									context: 'name',
								})
							)
							.setCustomId(`logging:channel:${module}`)
							.addComponents([
								{
									type: ComponentType.ActionRow,
									components: [
										{
											type: ComponentType.TextInput,
											custom_id: 'channelId',
											label: t('command.utility.configure.logs.modal.channel', {
												context: 'label',
											}),
											style: TextInputStyle.Short,
											required: false,
											min_length: 18,
											max_length: 20,
											value: data.channelId ?? null,
										},
									],
								},
							]);
						await collected.showModal(modal);
						return;
					}

					if (data.channelId) {
						const forum = interaction.guild.channels.cache.get(
							db.logging.base.channelId
						) as ForumChannel;
						const thread = (await forum.threads
							.fetch(data.channelId)
							.catch(() => {})) as AnyThreadChannel;

						await thread?.setLocked(true);
						await thread?.setArchived(true);
						await configModel.findByIdAndUpdate('logging', {
							$set: {
								logging: {
									...db.logging,
									[module]: {
										...db.logging[module],
										channelId: null,
									},
								},
							},
						});
						await client.config.updateLogs();
					} else if (!data.channelId) {
						const forum = interaction.guild.channels.cache.get(
							db.logging.base.channelId
						) as ForumChannel;

						const thread = await forum.threads.create({
							name: t(`command.utility.configure.logs.enum.${module}`, {
								context: 'name',
							}),
							message: {
								embeds: [
									{
										title: t(`command.utility.configure.logs.enum.${module}`, {
											context: 'name',
										}),
										description: t(`command.utility.configure.logs.enum.${module}`, {
											context: 'description',
										}),
										color: client.cc.invisible,
									},
								],
							},
						});

						await configModel.findByIdAndUpdate('logging', {
							$set: {
								logging: {
									...db.logging,
									[module]: {
										...db.logging[module],
										channelId: thread.id,
									},
								},
							},
						});
						await client.config.updateLogs();
					}

					db = await configModel.findById('logging');
					const embed = new EmbedBuilder()
						.setTitle(t(`command.utility.configure.logs.enum.${module}`, { context: 'name' }))
						.setColor(client.cc.invisible)
						.setDescription(
							[
								t('command.utility.configure.logs.enum.' + module, {
									context: 'description',
								}),
								t('command.utility.configure.logs.channel', {
									channel: db.logging[module].channelId
										? interaction.guild.channels.cache
												.get(db.logging[module].channelId)
												?.toString() || db.logging[module].channelId
										: t('command.utility.configure.none'),
								}),
								supportedLoggingIgnores.includes(module)
									? t('command.utility.configure.logs.ignores', {
											ignores: client.config.ignores.logs[module].channelIds.concat(
												client.config.ignores.logs[module].roleIds
											).length
												? `\n${client.config.ignores.logs[module].channelIds
														.map(
															(c: string) =>
																interaction.guild.channels.cache
																	.get(c)
																	?.toString() || c
														)
														.join(' ')} ${client.config.ignores.logs[
														module
												  ].roleIds
														.map(
															(c: string) =>
																interaction.guild.roles.cache
																	.get(c)
																	.toString() || c
														)
														.join(' ')}`
												: t('command.utility.configure.none'),
									  })
									: '',
							].join('\n\n')
						);

					await collected.update({
						embeds: [embed],
						components: [
							selectMenu(module),
							buttonComponents(
								module,
								client.config.logging[module].active ? 'enabled' : 'disabled'
							),
						],
					});
				} else if (collected.customId.startsWith('logging:ignore') && collected.isButton()) {
					const module = collected.customId.replace('logging:ignore:', '') as LoggingModules;

					const modal = new ModalBuilder()
						.setTitle(
							`${t(`command.utility.configure.logs.enum.${module}`, { context: 'name' })} ignores`
						)
						.setCustomId(`logging:ignores:${module}`)
						.addComponents([
							{
								type: ComponentType.ActionRow,
								components: [
									{
										type: ComponentType.TextInput,
										custom_id: 'channelIds',
										label: t('command.utility.configure.logs.modal.ignoreChannels', {
											context: 'label',
										}),
										style: TextInputStyle.Paragraph,
										required: false,
										max_length: 400,
										min_length: 0,
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
										label: t('command.utility.configure.logs.modal.ignoreRoles', {
											context: 'label',
										}),
										style: TextInputStyle.Paragraph,
										required: false,
										max_length: 400,
										min_length: 0,
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
				.setTitle(t(`command.utility.configure.automod.enum.${preSelected}`, { context: 'name' }))
				.setColor(client.cc.invisible)
				.setDescription(
					[
						t(`command.utility.configure.automod.enum.${preSelected}`, { context: 'description' }),
						t('command.utility.configure.automod.ignores', {
							ignores: client.config.ignores.automod[preSelected].channelIds.concat(
								client.config.ignores.automod[preSelected].roleIds
							).length
								? `\n${client.config.ignores.automod[preSelected].channelIds
										.map((c) => interaction.guild.channels.cache.get(c)?.toString() || c)
										.join(' ')} ${client.config.ignores.automod[preSelected].roleIds
										.map((c) => interaction.guild.roles.cache.get(c)?.toString() || c)
										.join(' ')}`
								: t('command.utility.configure.none'),
						}),
					].join('\n\n')
				)
				.setFields([
					{
						name: t('command.utility.configure.automod.enum.badwords', { context: 'name' }),
						value: client.config.automod.filteredWords.length
							? splitText(
									client.config.automod.filteredWords.map((w) => `\`${w}\``).join(' '),
									MAX_FIELD_VALUE_LENGTH
							  )
							: t('command.utility.configure.none'),
					},
				]);

			const selectMenu = (module: AutomodModules) => {
				return new ActionRowBuilder<SelectMenuBuilder>().setComponents([
					new SelectMenuBuilder().setCustomId('automod:modules').setOptions([
						{
							label: t('command.utility.configure.automod.enum.badwords', { context: 'name' }),
							value: 'badwords',
							default: module === 'badwords',
						},
						{
							label: t('command.utility.configure.automod.enum.invites', { context: 'name' }),
							value: 'invites',
							default: module === 'invites',
						},
						{
							label: t('command.utility.configure.automod.enum.largeMessage', { context: 'name' }),
							value: 'largeMessage',
							default: module === 'largeMessage',
						},
						{
							label: t('command.utility.configure.automod.enum.massMention', { context: 'name' }),
							value: 'massMention',
							default: module === 'massMention',
						},
						{
							label: t('command.utility.configure.automod.enum.massEmoji', { context: 'name' }),
							value: 'massEmoji',
							default: module === 'massEmoji',
						},
						{
							label: t('command.utility.configure.automod.enum.spam', { context: 'name' }),
							value: 'spam',
							default: module === 'spam',
						},
						{
							label: t('command.utility.configure.automod.enum.capitals', { context: 'name' }),
							value: 'capitals',
							default: module === 'capitals',
						},
						{
							label: t('command.utility.configure.automod.enum.urls', { context: 'name' }),
							value: 'urls',
							default: module === 'urls',
						},
					]),
				]);
			};

			const buttonComponents = (module: AutomodModules, state: 'enabled' | 'disabled') => {
				const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
					new ButtonBuilder()
						.setLabel(
							state === 'enabled'
								? t('command.utility.configure.automod.button.enabled')
								: t('command.utility.configure.automod.button.disabled')
						)
						.setStyle(state === 'enabled' ? ButtonStyle.Success : ButtonStyle.Danger)
						.setCustomId(`automod:toggle:${module}`),

					new ButtonBuilder()
						.setLabel(t('command.utility.configure.automod.button.editIgnores'))
						.setStyle(ButtonStyle.Secondary)
						.setCustomId(`automod:ignore:${module}`)
				);

				if (module === 'badwords')
					row.addComponents(
						new ButtonBuilder()
							.setLabel(t('command.utility.configure.automod.button.editBadwords'))
							.setStyle(ButtonStyle.Secondary)
							.setCustomId(`automod:badwords`)
					);

				return row;
			};

			const sentInteraction = await interaction.reply({
				embeds: [embed],
				fetchReply: true,
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
						.setTitle(
							t(`command.utility.configure.automod.enum.${selectedModule}`, { context: 'name' })
						)
						.setColor(client.cc.invisible)
						.setDescription(
							[
								t(`command.utility.configure.automod.enum.${selectedModule}`, {
									context: 'description',
								}),
								t('command.utility.configure.automod.ignores', {
									ignores: client.config.ignores.automod[selectedModule].channelIds.concat(
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
										: t('command.utility.configure.none'),
								}),
							].join('\n\n')
						);

					if (selectedModule === 'badwords')
						embed.setFields([
							{
								name: t('command.utility.configure.enum.badwords', { context: 'name' }),
								value: client.config.automod.filteredWords.length
									? splitText(
											client.config.automod.filteredWords
												.map((w) => `\`${w}\``)
												.join(' '),
											MAX_FIELD_VALUE_LENGTH
									  )
									: t('command.utility.configure.none'),
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
						.setTitle(
							`${t(`command.utility.configure.automod.enum.${module}`, {
								context: 'name',
							})} ignores`
						)
						.setCustomId(`automod:ignores:${module}`)
						.addComponents([
							{
								type: ComponentType.ActionRow,
								components: [
									{
										type: ComponentType.TextInput,
										custom_id: 'channelIds',
										label: t('command.utility.configure.automod.modal.ignoreChannels', {
											context: 'label',
										}),
										style: TextInputStyle.Paragraph,
										required: false,
										max_length: 400,
										min_length: 0,
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
										label: t('command.utility.configure.automod.modal.ignoreRoles', {
											context: 'label',
										}),
										style: TextInputStyle.Paragraph,
										required: false,
										max_length: 400,
										min_length: 0,
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
						.setTitle(t('command.utility.configure.automod.badwords', { context: 'name' }))
						.setCustomId('automod:badwords')
						.addComponents([
							{
								type: ComponentType.ActionRow,
								components: [
									{
										type: ComponentType.TextInput,
										custom_id: 'words',
										label: t('command.utility.configure.automod.modal.addBadwords', {
											context: 'label',
										}),
										style: TextInputStyle.Paragraph,
										required: false,
										max_length: 500,
										min_length: 0,
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
				interaction.editReply({
					embeds: [EmbedBuilder.from(sentInteraction.embeds[0]).spliceFields(0, 1)],
					components: [],
				});
			});
		} else if (mainModule === 'general') {
			const preSelected: GeneralConfigTypes = 'developers';
			const embed = new EmbedBuilder()
				.setTitle(
					t('command.utility.configure.general.enum.' + preSelected, {
						context: 'name',
					})
				)
				.setColor(client.cc.invisible)
				.setDescription(
					`${t('command.utility.configure.general.enum.' + preSelected, {
						context: 'description',
					})}\n\n${t('command.utility.configure.general.current', {
						value: client.config.general[preSelected].length
							? client.config.general[preSelected]
									.map((d) => client.users.cache.get(d)?.tag || d)
									.join(' | ')
							: t('command.utility.configure.none'),
					})}`
				);

			const selectMenu = (module: GeneralConfigTypes) => {
				return new ActionRowBuilder<SelectMenuBuilder>().setComponents([
					new SelectMenuBuilder().setCustomId('general:modules').setOptions([
						{
							label: t('command.utility.configure.general.enum.developers', {
								context: 'name',
							}),
							value: 'developers',
							default: module === 'developers',
						},
						{
							label: t('command.utility.configure.general.enum.appealLink', {
								context: 'name',
							}),
							value: 'appealLink',
							default: module === 'appealLink',
						},
						{
							label: t('command.utility.configure.general.enum.memberRoleId', {
								context: 'name',
							}),
							value: 'memberRoleId',
							default: module === 'memberRoleId',
						},
						{
							label: t('command.utility.configure.general.enum.modmailCategoryId', {
								context: 'name',
							}),
							value: 'modmailCategoryId',
							default: module === 'modmailCategoryId',
						},
						{
							label: t('command.utility.configure.general.enum.confirmation', {
								context: 'name',
							}),
							value: 'confirmation',
							default: module === 'confirmation',
						},
					]),
				]);
			};

			const buttonComponents = (module: GeneralConfigTypes) => {
				return new ActionRowBuilder<ButtonBuilder>().setComponents(
					module === 'confirmation'
						? new ButtonBuilder()
								.setLabel(
									client.config.general.confirmation
										? t('command.utility.configure.general.button.disable')
										: t('command.utility.configure.general.button.enable')
								)
								.setStyle(
									client.config.general.confirmation
										? ButtonStyle.Danger
										: ButtonStyle.Success
								)
								.setCustomId(`general:toggle:${module}`)
						: new ButtonBuilder()
								.setLabel(t('command.utility.configure.general.button.edit'))
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
						.setTitle(
							t('command.utility.configure.general.enum.' + selectedModule, {
								context: 'name',
							})
						)
						.setColor(client.cc.invisible)
						.setDescription(
							`${t('command.utility.configure.general.enum.' + selectedModule, {
								context: 'description',
							})}\n\n${t('command.utility.configure.general.current', {
								value:
									selectedModule === 'memberRoleId'
										? client.config.general.memberRoleId
											? interaction.guild.roles.cache
													.get(client.config.general.memberRoleId)
													?.toString() || client.config.general.memberRoleId
											: t('command.utility.configure.none')
										: selectedModule === 'modmailCategoryId'
										? client.config.general.modmailCategoryId
											? interaction.guild.channels.cache
													.get(client.config.general.modmailCategoryId)
													?.toString() || client.config.general.modmailCategoryId
											: t('command.utility.configure.none')
										: selectedModule === 'developers'
										? client.config.general.developers.length
											? client.config.general.developers
													.map((u) => client.users.cache.get(u)?.tag || u)
													.join(' | ')
											: t('command.utility.configure.none')
										: selectedModule === 'confirmation'
										? client.config.general.confirmation
											? t('command.utility.configure.general.button.enabled')
											: t('command.utility.configure.general.button.disabled')
										: client.config.general[selectedModule]?.toString() ??
										  t('command.utility.configure.none'),
							})}`
						);

					await collected.update({
						embeds: [embed],
						components: [selectMenu(selectedModule), buttonComponents(selectedModule)],
					});
				} else if (collected.customId.startsWith('general:toggle')) {
					const module = collected.customId.replace('general:toggle:', '') as GeneralConfigTypes;
					const data = await configModel.findById('general');

					await configModel.findByIdAndUpdate('general', {
						$set: {
							[module]: !data[module],
						},
					});
					await client.config.updateGeneral();

					const embed = new EmbedBuilder()
						.setTitle(
							t('command.utility.configure.general.enum.' + module, {
								context: 'name',
							})
						)
						.setColor(client.cc.invisible)
						.setDescription(
							`${t('command.utility.configure.general.enum.' + module, {
								context: 'description',
							})}\n\n${t('command.utility.configure.general.current', {
								value:
									module === 'memberRoleId'
										? client.config.general.memberRoleId
											? interaction.guild.roles.cache
													.get(client.config.general.memberRoleId)
													?.toString() || client.config.general.memberRoleId
											: t('command.utility.configure.none')
										: module === 'modmailCategoryId'
										? client.config.general.modmailCategoryId
											? interaction.guild.channels.cache
													.get(client.config.general.modmailCategoryId)
													?.toString() || client.config.general.modmailCategoryId
											: t('command.utility.configure.none')
										: module === 'developers'
										? client.config.general.developers.length
											? client.config.general.developers
													.map((u) => client.users.cache.get(u)?.tag || u)
													.join(' | ')
											: t('command.utility.configure.none')
										: module === 'confirmation'
										? client.config.general.confirmation
											? t('command.utility.configure.general.button.enabled')
											: t('command.utility.configure.general.button.disabled')
										: client.config.general[module]?.toString() ??
										  t('command.utility.configure.none'),
							})}`
						);

					await collected.update({
						embeds: [embed],
						components: [selectMenu(module), buttonComponents(module)],
					});
				} else if (collected.customId.startsWith('general:')) {
					const module = collected.customId.replace('general:', '') as GeneralConfigTypes;
					const modal = new ModalBuilder()
						.setTitle(
							t('command.utility.configure.general.enum.' + module, {
								context: 'name',
							})
						)
						.setCustomId(`general:${module}`)
						.addComponents([
							{
								type: ComponentType.ActionRow,
								components: [
									{
										type: ComponentType.TextInput,
										custom_id: 'input',
										label:
											t('command.utility.configure.general.modal.enter') +
											`${
												module === 'developers'
													? ' (' +
													  t(
															'command.utility.configure.general.modal.seprate'
													  ) +
													  ')'
													: ''
											}`,
										style: generalConfigIdType.includes(module)
											? TextInputStyle.Short
											: TextInputStyle.Paragraph,
										required: false,
										min_length: generalConfigIdType.includes(module) ? 18 : 0,
										max_length: generalConfigIdType.includes(module) ? 20 : 400,
										value:
											module === 'developers'
												? client.config.general[module].join(' ')
												: client.config.general[module]?.toString(),
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
				.setTitle(t('command.utility.configure.moderation.enum.' + preSelected, { context: 'name' }))
				.setColor(client.cc.invisible)
				.setDescription(
					[
						`${t('command.utility.configure.moderation.enum.' + preSelected, {
							context: 'description',
						})}\n`,
						t('command.utility.configure.moderation.embed.timeout1', {
							value: client.config.moderation[preSelected].timeout1,
							emoji: Emojis[1],
						}),
						t('command.utility.configure.moderation.embed.timeout2', {
							value: client.config.moderation[preSelected].timeout2,
							emoji: Emojis[2],
						}),
						t('command.utility.configure.moderation.embed.ban', {
							value: client.config.moderation[preSelected].ban,
							emoji: Emojis[3],
						}),
						t('command.utility.configure.moderation.embed.automodMulti', {
							value: client.config.moderation[preSelected].automod,
							emoji: Emojis[4],
						}),
					].join('\n')
				);

			const selectMenu = (module: ModerationConfigTypes) => {
				return new ActionRowBuilder<SelectMenuBuilder>().addComponents([
					new SelectMenuBuilder().setCustomId('moderation:modules').setOptions([
						{
							label: t('command.utility.configure.moderation.enum.counts', {
								context: 'name',
							}),
							value: 'counts',
							default: module === 'counts',
						},
						{
							label: t('command.utility.configure.moderation.enum.durations', {
								context: 'name',
							}),
							value: 'durations',
							default: module === 'durations',
						},
						{
							label: t('command.utility.configure.moderation.enum.defaults', {
								context: 'name',
							}),
							value: 'defaults',
							default: module === 'defaults',
						},
						{
							label: t('command.utility.configure.moderation.enum.reasons', {
								context: 'name',
							}),
							value: 'reasons',
							default: module === 'reasons',
						},
					]),
				]);
			};

			const buttonComponents = (module: ModerationConfigTypes) => {
				const row = new ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>();

				if (module === 'counts')
					row.setComponents([
						new ButtonBuilder()
							.setEmoji(Emojis[1])
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:counts:timeout1'),
						new ButtonBuilder()
							.setEmoji(Emojis[2])
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:counts:timeout2'),
						new ButtonBuilder()
							.setEmoji(Emojis[3])
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:counts:ban'),
						new ButtonBuilder()
							.setEmoji(Emojis[4])
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:counts:automod'),
					]);

				if (module === 'durations')
					row.setComponents([
						new ButtonBuilder()
							.setEmoji(Emojis[1])
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:durations:timeout1'),
						new ButtonBuilder()
							.setEmoji(Emojis[2])
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:durations:timeout2'),
						new ButtonBuilder()
							.setEmoji(Emojis[3])
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:durations:ban'),
						new ButtonBuilder()
							.setEmoji(Emojis[4])
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:durations:automod'),
					]);

				if (module === 'defaults')
					row.setComponents([
						new ButtonBuilder()
							.setEmoji(Emojis[1])
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:defaults:timeout'),
						new ButtonBuilder()
							.setEmoji(Emojis[2])
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:defaults:softban'),
						new ButtonBuilder()
							.setEmoji(Emojis[3])
							.setStyle(ButtonStyle.Secondary)
							.setCustomId('moderation:defaults:msgs'),
					]);

				if (module === 'reasons')
					row.setComponents(
						new SelectMenuBuilder()
							.setCustomId('moderation:reasons')
							.setMaxValues(1)
							.setMinValues(0)
							.setPlaceholder(t('command.utility.configure.moderation.editReasons'))
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
						.setTitle(
							t('command.utility.configure.moderation.enum.' + selectedModule, { context: 'name' })
						)
						.setColor(client.cc.invisible)
						.setDescription(
							[
								`${t('command.utility.configure.moderation.enum.' + selectedModule, {
									context: 'description',
								})}\n`,
								selectedModule === 'counts'
									? [
											t('command.utility.configure.moderation.embed.timeout1', {
												value: client.config.moderation[selectedModule].timeout1,
												emoji: Emojis[1],
											}),
											t('command.utility.configure.moderation.embed.timeout2', {
												value: client.config.moderation[selectedModule].timeout2,
												emoji: Emojis[2],
											}),
											t('command.utility.configure.moderation.embed.ban', {
												value: client.config.moderation[selectedModule].ban,
												emoji: Emojis[3],
											}),
											t('command.utility.configure.moderation.embed.automodMulti', {
												value: client.config.moderation[selectedModule].automod,
												emoji: Emojis[4],
											}),
									  ].join('\n')
									: selectedModule === 'durations'
									? [
											t('command.utility.configure.moderation.embed.timeout1', {
												value: convertTime(
													client.config.moderation[selectedModule].timeout1
												),
												emoji: Emojis[1],
											}),
											t('command.utility.configure.moderation.embed.timeout2', {
												value: convertTime(
													client.config.moderation[selectedModule].timeout2
												),
												emoji: Emojis[2],
											}),
											t('command.utility.configure.moderation.embed.ban', {
												value: client.config.moderation[selectedModule].ban
													? convertTime(
															client.config.moderation[selectedModule].ban
													  )
													: t(
															'command.utility.configure.moderation.embed.permanent'
													  ),
												emoji: Emojis[3],
											}),
											t('command.utility.configure.moderation.embed.automodTimeout', {
												value: convertTime(
													client.config.moderation[selectedModule].automod
												),
												emoji: Emojis[4],
											}),
									  ].join('\n')
									: selectedModule === 'defaults'
									? [
											t('command.utility.configure.moderation.embed.duration', {
												context: 'timeout',
												value: convertTime(
													client.config.moderation[selectedModule].timeout
												),
												emoji: Emojis[1],
											}),
											t('command.utility.configure.moderation.embed.duration', {
												context: 'softban',
												value: convertTime(
													client.config.moderation[selectedModule].softban
												),
												emoji: Emojis[2],
											}),
											t('command.utility.configure.moderation.embed.days', {
												context: 'softban',
												value: t(
													'command.utility.configure.moderation.days.' +
														client.config.moderation[
															selectedModule
														].msgs.toString()
												),
												emoji: Emojis[3],
											}),
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
						.setTitle(`Reasons for /${collected.values[0]}`)
						.setCustomId(`moderation:reasons:${collected.values[0]}`)
						.addComponents([
							{
								type: ComponentType.ActionRow,
								components: [
									{
										type: ComponentType.TextInput,
										custom_id: 'reasons',
										label: t('command.utility.configure.moderation.modal.reasons'),
										style: TextInputStyle.Paragraph,
										required: false,
										max_length: 4000,
										min_length: 0,
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
							t('command.utility.configure.moderation.enum.' + subModule, { context: 'name' })
						)
						.setCustomId(`moderation:${subModule}:${module}`)
						.addComponents([
							{
								type: ComponentType.ActionRow,
								components: [
									{
										type: ComponentType.TextInput,
										custom_id: 'input',
										label: t('command.utility.configure.moderation.modal.input'),
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
													: t(
															'command.utility.configure.moderation.embed.permanent'
													  )
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
