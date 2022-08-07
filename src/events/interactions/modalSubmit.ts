import { ChannelType, EmbedBuilder, InteractionType, TextChannel } from 'discord.js';
import { t } from 'i18next';
import { client } from '../..';
import {
	MAX_FIELD_VALUE_LENGTH,
	MAX_SOFTBAN_DURATION,
	MAX_TIMEOUT_DURATION,
	MIN_SOFTBAN_DURATION,
	MIN_TIMEOUT_DURATION,
} from '../../constants';
import { getURL } from '../../functions/automod/isURL';
import { convertTime, convertToTime, isValidTime } from '../../functions/convertTime';
import { splitText } from '../../functions/other/splitText';
import { configModel } from '../../models/config';
import { Event } from '../../structures/Event';
import {
	AutomodModules,
	deleteDayRewites,
	generalConfigDescriptions,
	GeneralConfigTypes,
	LoggingModules,
	loggingWebhookNames,
	moderationConfigDescriptions,
	ModerationConfigTypes,
	supportedLoggingIgnores,
} from '../../typings';

export default new Event('interactionCreate', async (interaction) => {
	if (interaction.type !== InteractionType.ModalSubmit) return;

	if (interaction.customId === 'automod:badwords') {
		if (!interaction.isFromMessage()) return;
		const input = interaction.fields.getTextInputValue('words');
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
					name: t('command.utility.configure.enum.badwords', { context: 'name' }),
					value: newWords.length
						? splitText(newWords.map((w) => `\`${w}\``).join(' '), MAX_FIELD_VALUE_LENGTH)
						: t('command.utility.configure.none'),
				}),
			],
		});
	}

	if (interaction.customId.startsWith('automod:ignores')) {
		if (!interaction.isFromMessage()) return;
		const module = interaction.customId.replace('automod:ignores:', '') as AutomodModules;
		const channelIds = interaction.fields.getTextInputValue('channelIds');
		const roleIds = interaction.fields.getTextInputValue('roleIds');

		const channels = channelIds
			.split(' ')
			.map((id) => {
				const find = interaction.guild.channels.cache.get(id);
				if (!find) return (id = null);
				if (find.type === ChannelType.GuildText || find.type === ChannelType.GuildVoice) {
					return id;
				} else return (id = null);
			})
			.filter((c) => c);

		const roles = roleIds
			.split(' ')
			.map((id) => {
				const find = interaction.guild.roles.cache.get(id);
				if (!find) return (id = null);
				return id;
			})
			.filter((c) => c);

		const data = await configModel.findById('ignores');
		await configModel.findByIdAndUpdate('ignores', {
			$set: {
				automod: {
					...data.automod,
					[module]: {
						channelIds: channels,
						roleIds: roles,
					},
				},
			},
		});
		await client.config.updateIgnores();
		await interaction.deferUpdate();
		await interaction.message.edit({
			embeds: [
				EmbedBuilder.from(interaction.message.embeds[0]).setDescription(
					[
						t(`command.utility.configure.automod.enum.${module}`, {
							context: 'description',
						}),
						t('command.utility.configure.automod.ignores', {
							ignores: client.config.ignores.automod[module].channelIds.concat(
								client.config.ignores.automod[module].roleIds
							).length
								? `\n${client.config.ignores.automod[module].channelIds
										.map((c) => interaction.guild.channels.cache.get(c).toString())
										.join(' ')} ${client.config.ignores.automod[module].roleIds
										.map((c) => interaction.guild.roles.cache.get(c).toString())
										.join(' ')}`
								: t('command.utility.configure.none'),
						}),
					].join('\n\n')
				),
			],
		});
	}

	if (interaction.customId.startsWith('logging:channel')) {
		if (!interaction.isFromMessage()) return;
		const module = interaction.customId.replace('logging:channel:', '') as LoggingModules;
		const channelId = interaction.fields.getTextInputValue('channelId');
		const channel = interaction.guild.channels.cache.get(channelId) as TextChannel;
		const data = await configModel.findById('logging');

		if (!channel || channel?.type !== ChannelType.GuildText)
			return interaction.reply({
				embeds: [client.embeds.error(t('command.utility.configure.logs.modal.invalidChannel'))],
				ephemeral: true,
			});

		if (data.logging[module].channelId === channelId) return interaction.deferUpdate();

		await client.config.webhooks[module].delete().catch(() => {});
		const newWebhook = await channel.createWebhook({
			name: loggingWebhookNames[module],
			avatar: client.user.displayAvatarURL({ extension: 'png' }),
		});

		await configModel.findByIdAndUpdate('logging', {
			$set: {
				logging: {
					...data.logging,
					[module]: {
						...data.logging[module],
						channelId: channelId,
						webhook: newWebhook.url,
					},
				},
			},
		});

		await client.config.updateLogs();
		await interaction.deferUpdate();
		await interaction.message.edit({
			embeds: [
				EmbedBuilder.from(interaction.message.embeds[0]).setDescription(
					[
						t('command.utility.configure.logs.enum.' + module, {
							context: 'description',
						}),
						t('command.utility.configure.logs.channel', {
							channel: data.logging[module].channelId
								? interaction.guild.channels.cache
										.get(data.logging[module].channelId)
										?.toString() || data.logging[module].channelId
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
												.join(' ')} ${client.config.ignores.logs[module].roleIds
												.map(
													(c: string) =>
														interaction.guild.roles.cache.get(c).toString() ||
														c
												)
												.join(' ')}`
										: t('command.utility.configure.none'),
							  })
							: '',
					].join('\n\n')
				),
			],
		});
	}

	if (interaction.customId.startsWith('logging:ignores')) {
		if (!interaction.isFromMessage()) return;
		const module = interaction.customId.replace('logging:ignores:', '') as LoggingModules;
		const data = await configModel.findById('logging');
		const channelIds = interaction.fields.getTextInputValue('channelIds');
		const roleIds = interaction.fields.getTextInputValue('roleIds');

		const channels = channelIds
			.split(' ')
			.map((id) => {
				const find = interaction.guild.channels.cache.get(id);
				if (!find) return (id = null);
				if (find.type === ChannelType.GuildText || find.type === ChannelType.GuildVoice) {
					return id;
				} else return (id = null);
			})
			.filter((c) => c);

		const roles = roleIds
			.split(' ')
			.map((id) => {
				const find = interaction.guild.roles.cache.get(id);
				if (!find) return (id = null);
				return id;
			})
			.filter((c) => c);

		await configModel.findByIdAndUpdate('ignores', {
			$set: {
				logs: {
					...(await configModel.findById('ignores')).logs,
					[module]: {
						channelIds: channels,
						roleIds: roles,
					},
				},
			},
		});

		await client.config.updateIgnores();
		await interaction.deferUpdate();
		await interaction.message.edit({
			embeds: [
				EmbedBuilder.from(interaction.message.embeds[0]).setDescription(
					[
						t('command.utility.configure.logs.enum.' + module, {
							context: 'description',
						}),
						t('command.utility.configure.logs.channel', {
							channel: data.logging[module].channelId
								? interaction.guild.channels.cache
										.get(data.logging[module].channelId)
										?.toString() || data.logging[module].channelId
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
												.join(' ')} ${client.config.ignores.logs[module].roleIds
												.map(
													(c: string) =>
														interaction.guild.roles.cache.get(c).toString() ||
														c
												)
												.join(' ')}`
										: t('command.utility.configure.none'),
							  })
							: '',
					].join('\n\n')
				),
			],
		});
	}

	if (interaction.customId.startsWith('general')) {
		if (!interaction.isFromMessage()) return;
		const module = interaction.customId.replace('general:', '') as GeneralConfigTypes;
		const input = interaction.fields.getTextInputValue('input') || null;

		module === 'developers'
			? input
					.split(' ')
					.map((t) => t.trim())
					.forEach(async (d) => {
						await client.users.fetch(d).catch(() => {});
					})
			: void null;
		const developers =
			module === 'developers'
				? input
						.split(' ')
						.map((t) => t.trim())
						.map((d) => {
							if (!client.users.cache.get(d)) d = null;
							return d;
						})
						.filter((e) => e)
				: null;

		if (module === 'memberRoleId' && input && !interaction.guild.roles.cache.get(input))
			return interaction.reply({
				embeds: [client.embeds.error('Please provide a valid role id in this server.')],
				ephemeral: true,
			});

		if (
			module === 'modmailCategoryId' &&
			input &&
			(!interaction.guild.channels.cache.get(input) ||
				interaction.guild.channels.cache.get(input)?.type !== ChannelType.GuildCategory)
		)
			return interaction.reply({
				embeds: [client.embeds.error('Please provide a valid category id in this server.')],
				ephemeral: true,
			});

		if (module === 'appealLink' && input && !getURL(input))
			return interaction.reply({
				embeds: [client.embeds.error('Please provide a valid url.')],
				ephemeral: true,
			});

		await configModel.findByIdAndUpdate('general', {
			$set: {
				[module]: module === 'developers' ? developers : module === 'appealLink' ? getURL(input) : input,
			},
		});
		await client.config.updateGeneral();
		await interaction.deferUpdate();
		await interaction.message.edit({
			embeds: [
				EmbedBuilder.from(interaction.message.embeds[0]).setDescription(
					`${generalConfigDescriptions[module]}\n\n• **Current:** ${
						module === 'memberRoleId'
							? client.config.general.memberRoleId
								? interaction.guild.roles.cache
										.get(client.config.general.memberRoleId)
										?.toString() || client.config.general.memberRoleId
								: 'None'
							: module === 'modmailCategoryId'
							? client.config.general.modmailCategoryId
								? interaction.guild.channels.cache
										.get(client.config.general.modmailCategoryId)
										?.toString() || client.config.general.modmailCategoryId
								: 'None'
							: module === 'developers'
							? client.config.general.developers.length
								? client.config.general.developers
										.map((u) => client.users.cache.get(u)?.tag || u)
										.join(' | ')
								: 'None'
							: client.config.general[module] ?? 'None'
					}`
				),
			],
		});
	}

	if (interaction.customId.startsWith('moderation:reasons')) {
		if (!interaction.isFromMessage()) return;
		const input = interaction.fields.getTextInputValue('reasons');
		const module = interaction.customId.replaceAll('moderation:reasons:', '');
		const reasons = [
			...new Set(
				input
					.split('||')
					.map((reason) => reason.trim())
					.filter((r) => r && r.length)
			),
		];

		await configModel.findByIdAndUpdate('moderation', {
			$set: {
				reasons: {
					...(await configModel.findById('moderation')).reasons,
					[module]: reasons,
				},
			},
		});
		await client.config.updateModeration();
		await interaction.deferUpdate();
	} else if (interaction.customId.startsWith('moderation')) {
		if (!interaction.isFromMessage()) return;
		const subModule = interaction.customId.split(':')[1] as ModerationConfigTypes;
		const module = interaction.customId.split(':')[2];
		const input = interaction.fields.getTextInputValue('input').trim();
		const data = await configModel.findById('moderation');
		let output: unknown = true;

		if (subModule === 'counts') {
			if (isNaN(parseInt(input)))
				return interaction.reply({
					embeds: [client.embeds.error('Please enter a valid number.')],
					ephemeral: true,
				});

			const array: number[] = [parseInt(input), data.counts.timeout1, data.counts.timeout2, data.counts.ban];
			const findDups = (a: number[]): number[] => a.filter((item, index) => a.indexOf(item) != index);
			if (module !== 'automod' && findDups(array).length)
				return interaction.reply({
					embeds: [client.embeds.error('Punishment count numbers must be unique.')],
					ephemeral: true,
				});

			output = parseInt(input);
		} else if (subModule === 'durations') {
			if (module === 'ban' && !isValidTime(input)) output = null;
			if (output === true && !isValidTime(input))
				return interaction.reply({
					embeds: [client.embeds.error(t('common.errors.invalidDuration'))],
					ephemeral: true,
				});

			const duration = convertToTime(input);
			if (
				output === true &&
				module === 'ban' &&
				(duration > MAX_SOFTBAN_DURATION || duration < MIN_SOFTBAN_DURATION)
			)
				return interaction.reply({
					embeds: [
						client.embeds.attention(
							t('common.errors.duration', {
								min: convertTime(MIN_SOFTBAN_DURATION),
								max: convertTime(MAX_SOFTBAN_DURATION),
							})
						),
					],
					ephemeral: true,
				});

			if (output === true && (duration > MAX_TIMEOUT_DURATION || duration < MIN_TIMEOUT_DURATION))
				return interaction.reply({
					embeds: [
						client.embeds.attention(
							t('common.errors.duration', {
								min: convertTime(MIN_TIMEOUT_DURATION),
								max: convertTime(MAX_TIMEOUT_DURATION),
							})
						),
					],
					ephemeral: true,
				});

			if (output) output = convertToTime(input);
		} else if (subModule === 'defaults') {
			if (module === 'msgs' && (isNaN(parseInt(input)) || parseInt(input) < 0 || parseInt(input) > 7))
				return interaction.reply({
					embeds: [client.embeds.error('The delete messages days must be between 0 and 7.')],
					ephemeral: true,
				});

			if (module === 'msgs') output = parseInt(input);

			if (output === true && !isValidTime(input))
				return interaction.reply({
					embeds: [client.embeds.error(t('common.errors.invalidDuration'))],
					ephemeral: true,
				});

			const duration = convertToTime(input);
			if (
				output === true &&
				module === 'timeout' &&
				(duration > MAX_TIMEOUT_DURATION || duration < MIN_TIMEOUT_DURATION)
			)
				return interaction.reply({
					embeds: [
						client.embeds.attention(
							t('common.errors.duration', {
								min: convertTime(MIN_TIMEOUT_DURATION),
								max: convertTime(MAX_TIMEOUT_DURATION),
							})
						),
					],
					ephemeral: true,
				});

			if (
				output === true &&
				module === 'softban' &&
				(duration > MAX_SOFTBAN_DURATION || duration < MIN_SOFTBAN_DURATION)
			)
				return interaction.reply({
					embeds: [
						client.embeds.attention(
							t('common.errors.duration', {
								min: convertTime(MIN_SOFTBAN_DURATION),
								max: convertTime(MAX_SOFTBAN_DURATION),
							})
						),
					],
					ephemeral: true,
				});

			if (output === true) output = convertToTime(input);
		}

		await configModel.findByIdAndUpdate('moderation', {
			$set: {
				[subModule]: {
					...(await configModel.findById('moderation'))[subModule],
					[module]: output,
				},
			},
		});
		await client.config.updateModeration();
		await interaction.deferUpdate();

		interaction.message.edit({
			embeds: [
				EmbedBuilder.from(interaction.message.embeds[0]).setDescription(
					[
						`${moderationConfigDescriptions[subModule]}\n`,
						subModule === 'counts'
							? [
									`• **Timeout #1:** ${client.config.moderation[subModule].timeout1}`,
									`• **Timeout #2:** ${client.config.moderation[subModule].timeout2}`,
									`• **Ban:** ${client.config.moderation[subModule].ban}`,
									`• **Automod multiplication:** ${client.config.moderation[subModule].automod}`,
							  ].join('\n')
							: subModule === 'durations'
							? [
									`• **Timeout #1:** ${convertTime(
										client.config.moderation[subModule].timeout1
									)}`,
									`• **Timeout #2:** ${convertTime(
										client.config.moderation[subModule].timeout2
									)}`,
									`• **Ban:** ${
										client.config.moderation[subModule].ban
											? convertTime(client.config.moderation[subModule].ban)
											: 'Permanent'
									}`,
									`• **Automod timeout:** ${convertTime(
										client.config.moderation[subModule].automod
									)}`,
							  ].join('\n')
							: subModule === 'defaults'
							? [
									`• **Timeout duration:** ${convertTime(
										client.config.moderation[subModule].timeout
									)}`,
									`• **Softban duration:** ${convertTime(
										client.config.moderation[subModule].softban
									)}`,
									`• **Delete message days:** ${
										deleteDayRewites[client.config.moderation[subModule].msgs]
									}`,
							  ].join('\n')
							: '',
					].join('\n')
				),
			],
		});
	}
});
