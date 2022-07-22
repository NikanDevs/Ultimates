import { ChannelType, Colors, EmbedBuilder, InteractionType, TextChannel } from 'discord.js';
import { client } from '../..';
import { MAX_FIELD_VALUE_LENGTH } from '../../constants';
import { getURL } from '../../functions/automod/isURL';
import { splitText } from '../../functions/other/splitText';
import { configModel } from '../../models/config';
import { Event } from '../../structures/Event';
import {
	automodModuleDescriptions,
	AutomodModules,
	generalConfigDescriptions,
	GeneralConfigTypes,
	loggingModuleDescriptions,
	LoggingModules,
	loggingWebhookNames,
	supportedLoggingIgnores,
} from '../../typings';

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
						? splitText(newWords.map((w) => `\`${w}\``).join(' '), MAX_FIELD_VALUE_LENGTH)
						: 'No filtered words',
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
						`${automodModuleDescriptions[module]}\n`,
						`\`Ignores:\` ${
							client.config.ignores.automod[module].channelIds.concat(
								client.config.ignores.automod[module].roleIds
							).length
								? `${client.config.ignores.automod[module].channelIds.map((c) =>
										interaction.guild.channels.cache.get(c).toString()
								  )} ${client.config.ignores.automod[module].roleIds.map((c) =>
										interaction.guild.roles.cache.get(c).toString()
								  )}`
								: 'No ignores found'
						}`,
					].join('\n')
				),
			],
		});
	}

	if (interaction.customId.startsWith('logging:channel')) {
		if (!interaction.isFromMessage()) return;
		const module = interaction.customId.replace('logging:channel:', '') as LoggingModules;
		const channelId = interaction.fields.getTextInputValue('channelId');
		const channel = interaction.guild.channels.cache.get(channelId);
		const data = await configModel.findById('logging');

		if (!channel || channel?.type !== ChannelType.GuildText)
			interaction.reply({
				embeds: [client.embeds.error('Please provide a valid text-channel ID.')],
				ephemeral: true,
			});

		if (data.logging[module].channelId === channelId) return interaction.deferUpdate();

		await client.config.webhooks[module].delete().catch(() => {});
		const newWebhook = await (channel as TextChannel).createWebhook({
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
						`${loggingModuleDescriptions[module]}\n`,
						`\`Channel:\` ${
							data.logging[module].channelId
								? interaction.guild.channels.cache.get(data.logging[module].channelId) ||
								  data.logging[module].channelId
								: 'None'
						}\n`,
						supportedLoggingIgnores.includes(module)
							? `\`Ignores:\`${
									client.config.ignores.logs[module].channelIds.concat(
										client.config.ignores.logs[module].roleIds
									).length
										? `${client.config.ignores.logs[module].channelIds.map((c: string) =>
												interaction.guild.channels.cache.get(c).toString()
										  )} ${client.config.ignores.logs[module].roleIds.map((c: string) =>
												interaction.guild.roles.cache.get(c).toString()
										  )}`
										: ' No ignores found'
							  }`
							: '',
					].join('\n')
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
						`${loggingModuleDescriptions[module]}\n`,
						`\`Channel:\` ${
							data.logging[module].channelId
								? interaction.guild.channels.cache.get(data.logging[module].channelId) ||
								  data.logging[module].channelId
								: 'None'
						}\n`,
						supportedLoggingIgnores.includes(module)
							? `\`Ignores:\`${
									client.config.ignores.logs[module].channelIds.concat(
										client.config.ignores.logs[module].roleIds
									).length
										? `${client.config.ignores.logs[module].channelIds.map((c: string) =>
												interaction.guild.channels.cache.get(c).toString()
										  )} ${client.config.ignores.logs[module].roleIds.map((c: string) =>
												interaction.guild.roles.cache.get(c).toString()
										  )}`
										: ' No ignores found'
							  }`
							: '',
					].join('\n')
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
				[module]: module === 'developers' ? developers : input,
			},
		});
		await client.config.updateGeneral();
		await interaction.deferUpdate();
		await interaction.message.edit({
			embeds: [
				EmbedBuilder.from(interaction.message.embeds[0]).setDescription(
					`${generalConfigDescriptions[module]}\n\n\`Current:\` ${
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

	if (interaction.customId.startsWith('add-reason')) {
		const words = interaction.fields.getTextInputValue('input');
		const module = interaction.customId.replaceAll('add-reason-', '');
		const currentReasons: string[] = (await configModel.findById('moderation')).reasons[module];
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

