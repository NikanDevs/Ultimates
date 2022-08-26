import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	Colors,
	ComponentType,
	DMChannel,
	EmbedBuilder,
	TextChannel,
} from 'discord.js';
import { client } from '../..';
import { modmailModel } from '../../models/modmail';
import { Event } from '../../structures/Event';
import { createModmailLog } from '../../functions/logs/createModmailLog';
import { ModmailActionTypes, PunishmentTypes } from '../../typings';
import { getModmailTicket } from '../../functions/cases/modmailCase';
import { generateModmailInfoEmbed } from '../../utils/generateModmailInfoEmbed';
import { convertTime } from '../../functions/convertTime';
import { durationsModel } from '../../models/durations';
import { t } from 'i18next';
import { modmailCollection } from '../../constants';
import { logger } from '../../logger';
let canDM: boolean = true;
let canSend: boolean = true;

export default new Event('messageCreate', async (message) => {
	const guild = client.guilds.cache.get(process.env.GUILD_ID);

	if (!message?.guild && message.channel.type === ChannelType.DM && !message.author?.bot) {
		if (!guild.channels.cache.get(client.config.general.modmailCategoryId))
			return message.channel?.send({
				content: t('event.modmail.notSet'),
			});

		// Checking for blacklist
		const blacklistData = await modmailModel.findById(message.author.id).catch(() => {});
		if (blacklistData)
			return message.channel?.send({
				embeds: [
					new EmbedBuilder()
						.setAuthor({ name: guild.name, iconURL: guild.iconURL() })
						.setTitle(t('event.modmail.blacklist', { context: 'title' }))
						.setDescription(t('event.modmail.blacklist', { context: 'description' }))
						.addFields([
							{
								name: t('event.modmail.blacklist', { context: 'reason' }),
								value: blacklistData.reason,
							},
						])
						.setColor(Colors.Red),
				],
			});

		const muteData = await durationsModel.findOne({ type: PunishmentTypes.Timeout, userId: message.author.id });
		if (muteData) return message.channel?.send({ content: t('event.modmail.timedOut') });

		if (modmailCollection.has(`confirmation:${message.author.id}`))
			return message.channel
				.send({ content: t('event.modmail.confirmation.exists') })
				.then((msg) => setTimeout(() => msg.delete(), 5 * 1000));

		// Checking for cooldowns
		const getOpenCooldownRamaining = `${~~(modmailCollection.get(`cooldown:${message.author.id}`) - Date.now())}`;
		if (modmailCollection.has(`cooldown:${message.author.id}`))
			return (message.channel as DMChannel).send({
				content: t('event.modmail.cooldown', { time: convertTime(+getOpenCooldownRamaining) }),
			});

		if (modmailCollection.has(`slowmode:${message.author.id}`)) return;

		const existingTicket = guild.channels.cache
			.filter(
				(channel) =>
					channel.parentId === client.config.general.modmailCategoryId &&
					channel.type === ChannelType.GuildText
			)
			.find((channel: TextChannel) => channel?.topic?.endsWith(message.author.id)) as TextChannel;

		if (existingTicket) {
			if (client.config.automod.filteredWords.some((word) => message.content.toLowerCase().includes(word)))
				return message.reply({
					content: t('event.modmail.filteredWord'),
				});

			modmailCollection.set(`slowmode:${message.author.id}`, Date.now() + 500);
			setTimeout(() => {
				modmailCollection.delete(`slowmode:${message.author.id}`);
			}, 500);

			const finalEmbeds = [];
			const toSendEmbed = new EmbedBuilder()
				.setAuthor({
					name: message.author.tag,
					iconURL: message.author.displayAvatarURL(),
					url: `https://discord.com/users/${message.author.id}`,
				})
				.setImage(message.attachments?.first()?.proxyURL)
				.setColor(client.cc.ultimates);

			if (message.content) toSendEmbed.setDescription(message.content);
			finalEmbeds.push(toSendEmbed);

			if (message.attachments?.size > 1) {
				let attachmentCount = 2;
				message.attachments
					?.map((attach) => attach)
					.slice(1, message.attachments?.size)
					.forEach((attachment) => {
						const attachmentEmbed = new EmbedBuilder()
							.setAuthor({ name: t('event.modmail.attachment', { count: attachmentCount }) })
							.setImage(attachment.proxyURL)
							.setColor(Colors.Orange);

						finalEmbeds.push(attachmentEmbed);
						attachmentCount = attachmentCount + 1;
					});
			}

			existingTicket
				.send({ embeds: finalEmbeds })
				.catch(() => {
					canSend = false;
				})
				.then(async () => {
					switch (canSend) {
						case true:
							await message.react(client.cc.success);
							break;

						case false:
							await message.react(client.cc.error);
							await message.reply({
								content: t('common.errors.occurred'),
							});
							break;
					}
					canSend = true;
				});
		} else if (!existingTicket) {
			const confirmationEmbed = new EmbedBuilder()
				.setAuthor({ name: guild.name, iconURL: guild.iconURL() })
				.setTitle(t('event.modmail.confirmation.title'))
				.setColor(client.cc.ultimates)
				.setDescription(t('event.modmail.confirmation.description', { guild: guild.name }));

			const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents([
				new ButtonBuilder()
					.setLabel(t('event.modmail.confirmation.create'))
					.setStyle(ButtonStyle.Success)
					.setCustomId('create'),
				new ButtonBuilder()
					.setLabel(t('event.modmail.confirmation.cancel'))
					.setStyle(ButtonStyle.Danger)
					.setCustomId('cancel'),
			]);

			let msg = await (message.channel as DMChannel).send({
				embeds: [confirmationEmbed],
				components: [buttons],
			});

			const confirmationColloctor = msg.createMessageComponentCollector({
				componentType: ComponentType.Button,
				time: 30000,
				filter: (msg) => msg.user.id === message.author.id,
			});
			modmailCollection.set(`confirmation:${message.author.id}`, null);

			confirmationColloctor.on('collect', async (collected) => {
				switch (collected.customId) {
					case 'cancel':
						confirmationColloctor.stop('fail');
						break;

					case 'create':
						confirmationColloctor.stop('success');

						await collected.reply({
							embeds: [
								new EmbedBuilder().setDescription(
									t('event.modmail.confirmation.creating', {
										emoji: client.cc.success,
									})
								),
							],
							ephemeral: true,
						});

						const threadChannel = await guild.channels.create({
							name: message.author.username,
							type: ChannelType.GuildText,
							parent: client.config.general.modmailCategoryId,
							topic: `A tunnel to contact **${message.author.username}**, they requested this ticket to be opened through DMs. | ID: ${message.author.id}`,
						});

						await threadChannel.send({ embeds: [await generateModmailInfoEmbed(message.author)] });
						await threadChannel.setRateLimitPerUser(2);

						await createModmailLog({
							action: ModmailActionTypes.Open,
							user: message.author,
							ticket: {
								type: 'REQUEST',
								channel: threadChannel,
							},
							ticketId: await getModmailTicket(),
						});

						// Thread Created
						const createdEmbed = new EmbedBuilder()
							.setAuthor({ name: guild.name, iconURL: guild.iconURL() })
							.setTitle(t('event.modmail.confirmation.created', { context: 'title' }))
							.setColor(Colors.Green)
							.setDescription(t('event.modmail.confirmation.created', { context: 'description' }));
						msg?.delete();
						message.author.send({ embeds: [createdEmbed] });
						break;
				}
			});

			confirmationColloctor.on('end', (_, reason) => {
				modmailCollection.delete(`confirmation:${message.author.id}`);

				if (reason == 'success') return;
				msg?.delete();
			});
		}
	} else if (
		message?.guild &&
		message.channel.type === ChannelType.GuildText &&
		!message.author?.bot &&
		message.channel.parentId === client.config.general.modmailCategoryId
	) {
		const channelTopic = (message.channel as TextChannel).topic;
		const usersThread = guild.members.cache.find(
			(user) =>
				user.id === channelTopic.split('|')[channelTopic.split('|').length - 1].replace('ID:', '').trim()
		);

		if (!usersThread) {
			logger.warn('Modmail - User was not found in the channel topic; channel ID: ' + message.channel.id);
			return (message.channel as TextChannel).send({
				content: t('common.errors.occurred'),
			});
		}

		const finalEmbeds = [];
		const toSendEmbed = new EmbedBuilder()
			.setAuthor({
				name: t('event.modmail.staff'),
				iconURL: 'https://cdn.discordapp.com/attachments/870637449158742057/909825851225427978/staff-icon.png',
			})
			.setImage(message.attachments?.first()?.proxyURL)
			.setColor(client.cc.ultimates);

		if (message.content) toSendEmbed.setDescription(message.content);

		finalEmbeds.push(toSendEmbed);

		if (message.attachments?.size > 1) {
			let attachmentCount = 2;
			message.attachments
				?.map((attach) => attach)
				.slice(1, message.attachments?.size)
				.forEach((attachment) => {
					const attachmentEmbed = new EmbedBuilder()
						.setAuthor({ name: t('event.modmail.attachment', { count: attachmentCount }) })
						.setImage(attachment.proxyURL)
						.setColor(Colors.Orange);

					finalEmbeds.push(attachmentEmbed);
					attachmentCount = attachmentCount + 1;
				});
		}

		usersThread
			.send({ embeds: finalEmbeds })
			?.catch(() => {
				canDM = false;
			})
			.then(async () => {
				switch (canDM) {
					case true:
						await message.react(client.cc.success);
						break;

					case false:
						await message.react(client.cc.error);
						await message.reply({
							content: t('event.modmail.cannotDM'),
						});
						break;
				}
				canDM = true;
			});
	}
});
