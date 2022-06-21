import {
	ChannelType,
	Collection,
	ComponentType,
	DMChannel,
	EmbedBuilder,
	Guild,
	TextChannel,
} from 'discord.js';
import { client } from '../..';
import { modmailModel } from '../../models/modmail';
import { Event } from '../../structures/Event';
import { createModmailLog } from '../../functions/logs/createModmailLog';
import { ModmailActionType } from '../../typings/Modmail';
import { getModmailTicket } from '../../functions/cases/ModmailCase';
import { generateModmailInfoEmbed } from '../../utils/generateModmailInfoEmbed';
import { convertTime } from '../../functions/convertTime';
export const modmailCooldown: Collection<string, number> = new Collection();
let confirmationExists: boolean = false;
let canDM: boolean = true;
let canSend: boolean = true;

export default new Event('messageCreate', async (message) => {
	const guild =
		client.guilds.cache.get(process.env.GUILD_ID) ||
		((await client.guilds.fetch(process.env.GUILD_ID)) as Guild);

	if (!message?.guild && message.channel.type === ChannelType.DM && !message.author?.bot) {
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
			.setColor(client.cc.errorC);

		if (data)
			return (message.channel as DMChannel)?.send({
				embeds: [blacklistedEmbed],
			});

		if (confirmationExists === true)
			return (message.channel as DMChannel).send({
				content: 'Please accept or cancel the existing confirmation.',
			});

		// Checking for cooldowns
		const getOpenCooldownRamaining = `${~~(
			modmailCooldown.get(`open_${message.author.id}`) - Date.now()
		)}`;

		if (modmailCooldown.has(`open_${message.author.id}`))
			return (message.channel as DMChannel).send({
				content: `You need to wait **${convertTime(
					+getOpenCooldownRamaining
				)}** to open a ticket again.`,
			});

		if (modmailCooldown.has(`send-message_${message.author.id}`)) return;

		const openedThread = guild.channels.cache
			.filter(
				(channel) =>
					channel.parentId === client.config.general.guild.modmailCategoryId &&
					channel.type === ChannelType.GuildText
			)
			.find((channel: TextChannel) =>
				channel?.topic?.endsWith(message.author.id)
			) as TextChannel;

		if (openedThread) {
			if (
				client.config.automod.filteredWords.some((word) =>
					message.content.toLowerCase().includes(word)
				)
			)
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
							.setColor(client.util.resolve.color('Orange'));

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
							await message.react(client.config.general.success);
							break;

						case false:
							await message.react(client.config.general.error);
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

			let msg = await (message.channel as DMChannel).send({
				embeds: [confirmationEmbed],
				components: [client.util.build.confirmationButtons('Create', 'Cancel')],
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

						const threadChannel = await guild.channels.create(
							message.author.username,
							{
								type: ChannelType.GuildText,
								parent: client.config.general.guild.modmailCategoryId,
								topic: `A tunnel to contact **${message.author.username}**, they requested this ticket to be opened through DMs. | ID: ${message.author.id}`,
								reason: `Modmail ticket open request.`,
							}
						);

						await threadChannel.send({
							embeds: [await generateModmailInfoEmbed(message.author)],
						});

						createModmailLog({
							action: ModmailActionType.Open,
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
							.setColor(client.util.resolve.color('Green'))
							.setDescription(
								[
									'The ticket you requested has been created.',
									'Please consider asking your question and wait for a staff member to respond.',
									`\n• If your message wasn't reacted with ${client.config.general.success}, it was not sent.`,
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
		message.channel.parentId === client.config.general.guild.modmailCategoryId
	) {
		const channelTopic = (message.channel as TextChannel).topic;
		const usersThread = guild.members.cache.find(
			(user) => user.id === channelTopic.slice(channelTopic.length - user.id.length)
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
						.setColor(client.util.resolve.color('Orange'));

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
						await message.react(client.config.general.success);
						break;

					case false:
						await message.react(client.config.general.error);
						await message.reply({
							content: "I wasn't able to DM the user.",
						});
						break;
				}
				canDM = true;
			});
	}
});
