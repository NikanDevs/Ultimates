import {
	ButtonStyle,
	ChannelType,
	Collection,
	ComponentType,
	DMChannel,
	Guild,
	GuildMember,
	TextChannel,
	User,
} from 'discord.js';
import { client } from '../..';
import { modmailModel } from '../../models/modmail';
import { Event } from '../../structures/Event';
import { badwords } from '../../json/automod.json';
import { modmailLogging } from '../../webhooks';
import { createModmailLog } from '../../functions/logs/createModmailLog';
import { ModmailActionType } from '../../typings/Modmail';
import { getModmailCase } from '../../functions/cases/ModmailCase';
export const serverId = client.server.id;
export const categoryId = '948232668611506248';
export const modmailCooldown: Collection<string, number> = new Collection();
let confirmationExists: boolean = false;
let canDM: boolean = true;
let canSend: boolean = true;

export default new Event('messageCreate', async (message) => {
	const guild =
		client.guilds.cache.get(serverId) || ((await client.guilds.fetch(serverId)) as Guild);
	// const category = guild.channels.cache.get(categoryId) || await guild.channels.fetch(categoryId) as CategoryChannel;

	if (!message?.guild && message.channel.type === ChannelType.DM && !message.author?.bot) {
		// Checking for member role
		if (guild.members?.cache.get(message.author.id)?.roles?.cache.get('793410990535999508'))
			return;

		// Checking for blacklist
		const data = await modmailModel.findById(message.author.id);
		const blacklistedEmbed = client.util
			.embed()
			.setAuthor({ name: guild.name, iconURL: guild.iconURL() })
			.setTitle('Blacklisted From Opening Threads')
			.setURL(`${client.server.invite}`)
			.setDescription(
				[
					"Sorry, but you've been blacklisted from opening modmail threads.",
					"If you think that this punishment is not fair and you don't deserve it, please contact a moderator!",
				].join('\n')
			)
			.addFields({ name: 'Reason', value: `${data?.reason}` })
			.setColor(client.colors.error);

		if (data)
			return (message.channel as DMChannel)?.send({
				embeds: [blacklistedEmbed],
			});

		if (confirmationExists === true)
			return (message.channel as DMChannel).send({
				content: 'Please accept or deny the thread creation before you send any other messages!',
			});

		// Checking for cooldowns
		const getCooldownRamainingOnEnd = `${~~(
			modmailCooldown.get(`create-new-on-end_${message.author.id}`) - Date.now()
		)}`;

		if (modmailCooldown.has(`create-new-on-end_${message.author.id}`))
			return (message.channel as DMChannel).send({
				content: `You need to wait **${client.util.convertTime(
					+getCooldownRamainingOnEnd / 1000
				)}** to open a thread again.`,
			});

		const getCooldownRamainingOnClose = `${~~(
			modmailCooldown.get(`create-new-on-close_${message.author.id}`) - Date.now()
		)}`;

		if (modmailCooldown.has(`create-new-on-close_${message.author.id}`))
			return (message.channel as DMChannel).send({
				content: `You need to wait **${client.util.convertTime(
					+getCooldownRamainingOnClose / 1000
				)}** to open a thread again.`,
			});

		if (modmailCooldown.has(`send-message_${message.author.id}`)) return;

		const openedThread = guild.channels.cache
			.filter(
				(channel) =>
					channel.parentId === categoryId && channel.type === ChannelType.GuildText
			)
			.find((channel: TextChannel) =>
				channel?.topic?.endsWith(`${message.author.id}`)
			) as TextChannel;

		if (openedThread) {
			if (badwords.some((word) => message.content.toLowerCase().includes(word))) {
				message.reply({
					content: "You're not allowed to use that word in modmails.",
				});
				message.react(client.cc.error);
				return;
			}

			modmailCooldown.set(`send-message_${message.author.id}`, Date.now() + 500);
			setTimeout(() => {
				modmailCooldown.delete(`send-message_${message.author.id}`);
			}, 500);

			const finalEmbeds = [];
			const toSendEmbed = client.util
				.embed()
				.setAuthor({
					name: message.author.tag,
					iconURL: message.author.displayAvatarURL(),
					url: `https://discord.com/users/${message.author.id}`,
				})
				.setImage(message.attachments?.first()?.proxyURL)
				.setColor(client.colors.ultimates);

			if (message.content) toSendEmbed.setDescription(message.content);
			finalEmbeds.push(toSendEmbed);

			if (message.attachments?.size > 1) {
				let attachmentCounter = 2;
				message.attachments
					?.map((attach) => attach)
					.slice(1, message.attachments?.size)
					.forEach((attachment) => {
						const attachmentEmbed = client.util
							.embed()
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
			const confirmationEmbed = client.util
				.embed()
				.setAuthor({ name: guild.name, iconURL: guild.iconURL() })
				.setTitle('Are you sure that you want to create a thread?')
				.setColor(client.colors.ultimates)
				.setDescription(
					[
						"Please open a thread if you're sure that your question is related to an option below!",
						'Creating tickets for not an actual reason night get you punishments!',
					].join('\n')
				)
				.addFields({
					name: '** **',
					value: [
						`**➜ #1 Reporting A User**`,
						`You can report users for the stuff happened in ${guild.name}! This can include people who are breaking the rules, dm advertising, sending you gore content etc..\n`,
						'**➜ #2 Request Role**',
						`You can open a thread if you want to get a role in ${guild.name}! These roles can only be the creator roles, giveaways, event host etc.. Please do not open a thread for free staff.\n`,
						'**➜ #3 Appeal**',
						"You can create a thread if you want to appeal a warning given by a **moderator** to you. Please don't for auto moderation warnings removal as they all expire in 2 days!\n",
						`**➜ #4 Any Other Question**`,
						`You can create a thread if you want to ask a question about ${guild.name}. For example: How do I suggest something to the server.`,
					].join('\n'),
				});

			const confirmationRow = client.util.actionRow().addComponents(
				client.util
					.button()
					.setLabel('Create')
					.setStyle(ButtonStyle['Success'])
					.setCustomId('modmail-create'),

				client.util
					.button()
					.setLabel('Cancel')
					.setStyle(ButtonStyle['Danger'])
					.setCustomId('modmail-cancel')
			);

			let msg = await (message.channel as DMChannel).send({
				embeds: [confirmationEmbed],
				components: [confirmationRow],
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
					// if the person choice is cancel
					case 'modmail-cancel':
						// Stopping the collocter
						confirmationColloctor.stop('success');

						// Setting a cooldown to open new threads
						modmailCooldown.set(
							`create-new-on-end_${message.author.id}`,
							Date.now() + 10000
						);
						setTimeout(() => {
							modmailCooldown.delete(`create-new-on-end_${message.author.id}`);
						}, 10000);

						// Editing the message
						const cancelledEmbed = client.util
							.embed()
							.setAuthor({ name: guild.name, iconURL: guild.iconURL() })
							.setTitle('Cancelled')
							.setColor(client.util.resolve.color('Red'))
							.setDescription('The thread creation process was cancelled!');
						msg.edit({ embeds: [cancelledEmbed], components: [] });
						break;

					// If the person choice is create
					case 'modmail-create':
						// Stopping the collector
						confirmationColloctor.stop('success');

						// Creating the thread
						const creatingEmbed = client.util
							.embed()
							.setAuthor({ name: guild.name, iconURL: guild.iconURL() })
							.setTitle('Creating the thread')
							.setColor(client.colors.wait)
							.setDescription(
								'Your thread is being created... please wait and be patient.'
							);
						await msg.edit({ embeds: [creatingEmbed], components: [] });

						const threadChannel = await guild.channels.create(
							message.author.username,
							{
								type: ChannelType.GuildText,
								parent: categoryId,
								topic: `[Request] - Thread Created by ${message.author.tag} - ID: ${message.author.id}`,
								reason: `Modmail thread created by ${message.author.tag}`,
							}
						);

						const guildMember = guild.members.cache.get(
							message.author.id
						) as GuildMember;
						const threadChannelFirstEmbed = client.util
							.embed()
							.setAuthor({
								name: message.author.tag,
								iconURL: message.author.displayAvatarURL(),
							})
							.setColor(client.colors.ultimates)
							.setDescription(`${message.author} • ID: ${message.author.id}`)
							.setThumbnail(message.author.displayAvatarURL())
							.addFields(
								{
									name: 'Account Information',
									value: [
										`• **Username:** ${message.author.tag}`,
										`• **ID:** ${message.author.id}`,
										`• **Registered:** <t:${~~(
											+message.author?.createdAt / 1000
										)}:f> | <t:${~~(
											+message.author?.createdAt / 1000
										)}:R>`,
									].join('\n'),
								},
								{
									name: 'Server Information',
									value: [
										`• **Joined**: <t:${~~(
											+guildMember.joinedAt / 1000
										)}:f> | <t:${~~(
											+guildMember.joinedAt / 1000
										)}:R>`,
										`• **Nickname**: ${
											message.author.username ==
											guildMember.displayName
												? `No Nickname`
												: guildMember.displayName
										}`,
									].join('\n'),
								}
							);

						await threadChannel.send({ embeds: [threadChannelFirstEmbed] });

						createModmailLog({
							action: ModmailActionType.Open,
							user: message.author,
							ticket: {
								type: 'REQUEST',
								channel: threadChannel,
							},
							ticketId: await getModmailCase(),
						});

						// Thread Created
						const createdEmbed = client.util
							.embed()
							.setAuthor({ name: guild.name, iconURL: guild.iconURL() })
							.setTitle('Thread Created')
							.setColor(client.util.resolve.color('Green'))
							.setDescription(
								[
									'Your thread has been created!',
									"Please write your question here and don't wait for a staff member to tell you about asking the question.",
									`Be patient and wait for a staff member to respond, we'll get to you as soon as possible!\n`,
									`If some of your messages doesn't get reacted with ${client.cc.success}, it means your message wasn't sent This can be caused due to you sending messages very fast.`,
								].join('\n')
							);
						msg.edit({ embeds: [createdEmbed], components: [] });

						break;
				}
			});

			confirmationColloctor.on('end', (_, reason) => {
				// Adding cooldowns and updating confirmation Exist
				confirmationExists = false;
				if (reason == 'success') return;

				// Setting a cooldown to open new threads
				modmailCooldown.set(
					`create-new-on-end_${message.author.id}`,
					Date.now() + 10000
				);
				setTimeout(() => {
					modmailCooldown.delete(`create-new-on-end_${message.author.id}`);
				}, 10000);

				// Timed Out message
				const timedOutEmbed = client.util
					.embed()
					.setAuthor({ name: guild.name, iconURL: guild.iconURL() })
					.setTitle('Timed Out!')
					.setColor(client.util.resolve.color('Red'))
					.setDescription(
						[
							'Your ticket creation timed out due to your late respond...',
							'If you wish to create another thread, please message the bot again.',
						].join('\n')
					);
				msg.edit({ components: [], embeds: [timedOutEmbed] });
			});
		}
	} else if (
		message?.guild &&
		message.channel.type === ChannelType.GuildText &&
		!message.author?.bot &&
		message.channel.parentId === categoryId
	) {
		const channelTopic = (message.channel as TextChannel).topic;
		const usersThread = guild.members.cache.find(
			(user) => user.id === channelTopic.slice(channelTopic.length - user.id.length)
		);

		if (!usersThread)
			return (message.channel as TextChannel).send({
				content: "The message can't be sent - User not found",
			});

		const finalEmbeds = [];
		const toSendEmbed = client.util
			.embed()
			.setAuthor({
				name: 'Staff Member',
				iconURL: 'https://cdn.discordapp.com/attachments/870637449158742057/909825851225427978/staff-icon.png',
			})
			.setImage(message.attachments?.first()?.proxyURL)
			.setColor(client.colors.ultimates);

		if (message.content) toSendEmbed.setDescription(message.content);

		finalEmbeds.push(toSendEmbed);

		if (message.attachments?.size > 1) {
			let attachmentCounter = 2;
			message.attachments
				?.map((attach) => attach)
				.slice(1, message.attachments?.size)
				.forEach((attachment) => {
					const attachmentEmbed = client.util
						.embed()
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
						await message.react(client.cc.success);
						break;

					case false:
						await message.react(client.cc.error);
						await message.reply({
							content: "Whoops, but I can't DM that user.",
						});
						break;
				}
				canDM = true;
			});
	}
});
