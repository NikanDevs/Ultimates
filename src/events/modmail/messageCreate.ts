import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	Collection,
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
export const modmailCooldown: Collection<string, number> = new Collection();
let confirmationExists: boolean = false;
let canDM: boolean = true;
let canSend: boolean = true;

export default new Event('messageCreate', async (message) => {
	const guild = client.guilds.cache.get(process.env.GUILD_ID);

	if (!message?.guild && message.channel.type === ChannelType.DM && !message.author?.bot) {
		if (!guild.channels.cache.get(client.config.general.modmailCategoryId))
			return message.channel?.send({
				content: 'This server does not have the modmail module set up.',
			});

		// Checking for blacklist
		const data = await modmailModel.findById(message.author.id);
		const blacklistedEmbed = new EmbedBuilder()
			.setAuthor({ name: guild.name, iconURL: guild.iconURL() })
			.setTitle('Blacklisted from using modmail')
			.setDescription(
				[
					'Sorry, but looks like you were blacklisted from using the modmail.',
					"If you think that this is not fair and you don't deserve it, please contact a moderator!",
				].join('\n')
			)
			.addFields([{ name: 'Reason', value: `${data?.reason}` }])
			.setColor(Colors.Red);

		if (data)
			return message.channel?.send({
				embeds: [blacklistedEmbed],
			});

		const muteData = await durationsModel.findOne({
			type: PunishmentTypes.Timeout,
			userId: message.author.id,
		});
		if (muteData)
			return (message.channel as DMChannel)?.send({
				content: 'You can not open a ticket right now.',
			});

		if (confirmationExists === true)
			return (message.channel as DMChannel).send({
				content: 'Please accept or cancel the existing confirmation.',
			});

		// Checking for cooldowns
		const getOpenCooldownRamaining = `${~~(modmailCooldown.get(`open_${message.author.id}`) - Date.now())}`;

		if (modmailCooldown.has(`open_${message.author.id}`))
			return (message.channel as DMChannel).send({
				content: `You need to wait **${convertTime(+getOpenCooldownRamaining)}** to open a ticket again.`,
			});

		if (modmailCooldown.has(`send-message_${message.author.id}`)) return;

		const openedThread = guild.channels.cache
			.filter(
				(channel) =>
					channel.parentId === client.config.general.modmailCategoryId &&
					channel.type === ChannelType.GuildText
			)
			.find((channel: TextChannel) => channel?.topic?.endsWith(message.author.id)) as TextChannel;

		if (openedThread) {
			if (client.config.automod.filteredWords.some((word) => message.content.toLowerCase().includes(word)))
				return message.reply({
					content: "You're not allowed to use this word in modmails.",
				});

			modmailCooldown.set(`send-message_${message.author.id}`, Date.now() + 500);
			setTimeout(() => {
				modmailCooldown.delete(`send-message_${message.author.id}`);
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
				let attachmentCounter = 2;
				message.attachments
					?.map((attach) => attach)
					.slice(1, message.attachments?.size)
					.forEach((attachment) => {
						const attachmentEmbed = new EmbedBuilder()
							.setAuthor({ name: `Attachment #${attachmentCounter}` })
							.setImage(attachment.proxyURL)
							.setColor(Colors.Orange);

						finalEmbeds.push(attachmentEmbed);
						attachmentCounter = attachmentCounter + 1;
					});
			}

			openedThread
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
								content: 'Something went wrong while trying to send your message, try again!',
							});
							break;
					}
					canSend = true;
				});
		} else if (!openedThread) {
			const confirmationEmbed = new EmbedBuilder()
				.setAuthor({ name: guild.name, iconURL: guild.iconURL() })
				.setTitle('Are you sure that you want to create a ticket?')
				.setColor(client.cc.ultimates)
				.setDescription(
					[
						`Confirming this message creates a tunnel between you and **${guild.name}** staff members.`,
						'Please consider creating a ticket if you have an important question or you need support!',
					].join(' ')
				);

			const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents([
				new ButtonBuilder().setLabel('Create').setStyle(ButtonStyle.Success).setCustomId('1'),
				new ButtonBuilder().setLabel('Cancel').setStyle(ButtonStyle.Danger).setCustomId('2'),
			]);

			let msg = await (message.channel as DMChannel).send({
				embeds: [confirmationEmbed],
				components: [buttons],
			});

			confirmationExists = true;
			const confirmationColloctor = msg.createMessageComponentCollector({
				componentType: ComponentType.Button,
				time: 30000,
				filter: (msg) => msg.user.id === message.author.id,
			});

			confirmationColloctor.on('collect', async (collected) => {
				collected.deferUpdate();

				switch (collected.customId) {
					// If the person choice is cancel
					case '2':
						confirmationColloctor.stop('fail');
						break;

					// If the person choice is create
					case '1':
						confirmationColloctor.stop('success');

						await msg.edit({
							content: 'Please wait...',
							embeds: [],
							components: [],
						});

						const threadChannel = await guild.channels.create({
							name: message.author.username,
							type: ChannelType.GuildText,
							parent: client.config.general.modmailCategoryId,
							topic: `A tunnel to contact **${message.author.username}**, they requested this ticket to be opened through DMs. | ID: ${message.author.id}`,
							reason: `Modmail ticket open request.`,
						});

						await threadChannel.send({
							embeds: [await generateModmailInfoEmbed(message.author)],
						});

						createModmailLog({
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
							.setTitle('Ticket created')
							.setColor(Colors.Green)
							.setDescription(
								[
									'The ticket you requested has been created.',
									'Please consider asking your question and wait for a staff member to respond.',
									`\n• If your message wasn't reacted with ${client.cc.success}, it was not sent.`,
								].join('\n')
							);
						msg?.delete();
						message.author.send({ embeds: [createdEmbed] });
						break;
				}
			});

			confirmationColloctor.on('end', (_, reason) => {
				confirmationExists = false;

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

		if (!usersThread)
			return (message.channel as TextChannel).send({
				content: 'The user was not found.',
			});

		const finalEmbeds = [];
		const toSendEmbed = new EmbedBuilder()
			.setAuthor({
				name: 'Staff Member',
				iconURL: 'https://cdn.discordapp.com/attachments/870637449158742057/909825851225427978/staff-icon.png',
			})
			.setImage(message.attachments?.first()?.proxyURL)
			.setColor(client.cc.ultimates);

		if (message.content) toSendEmbed.setDescription(message.content);

		finalEmbeds.push(toSendEmbed);

		if (message.attachments?.size > 1) {
			let attachmentCounter = 2;
			message.attachments
				?.map((attach) => attach)
				.slice(1, message.attachments?.size)
				.forEach((attachment) => {
					const attachmentEmbed = new EmbedBuilder()
						.setAuthor({ name: `Attachment #${attachmentCounter}` })
						.setImage(attachment.proxyURL)
						.setColor(Colors.Orange);

					finalEmbeds.push(attachmentEmbed);
					attachmentCounter = attachmentCounter + 1;
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
							content: "I wasn't able to DM the user.",
						});
						break;
				}
				canDM = true;
			});
	}
});
