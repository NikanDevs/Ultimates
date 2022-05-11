import {
	ChannelType,
	GuildMember,
	Message,
	TextChannel,
	User,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ComponentType,
	CategoryChannel,
} from 'discord.js';
import { create } from 'sourcebin';
import { categoryId, modmailCooldown } from '../../events/modmail/messageCreate';
import { getModmailCase } from '../../functions/cases/ModmailCase';
import { createModmailLog } from '../../functions/logs/createModmailLog';
import { modmailModel } from '../../models/modmail';
import { Command } from '../../structures/Command';
import { ModmailActionType, ModmailTicketData } from '../../typings/Modmail';

export default new Command({
	name: 'modmail',
	description: 'Actions on modmail.',
	directory: 'modmail',
	permission: ['ManageMessages'],
	cooldown: 10000,
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'close',
			description: 'Closes the ticket in the current channel.',
			type: ApplicationCommandOptionType.Subcommand,
		},
		{
			name: 'open',
			description: "Open a modmail directly into a user's DMs.",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'user',
					description: 'The user you wish to open modmail for.',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: 'reason',
					description: "The reason that you're creating this thread.",
					type: ApplicationCommandOptionType.String,
					required: false,
				},
			],
		},
		{
			name: 'blacklist',
			description: 'Blacklists/Unblacklists a user from the modmail.',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'user',
					description: 'The user you wish to take action on.',
					type: ApplicationCommandOptionType.User,
				},
				{
					name: 'user-id',
					description: 'The Id of the user you wish to take action on.',
					type: ApplicationCommandOptionType.String,
				},
				{
					name: 'reason',
					description: 'The reason of the action.',
					type: ApplicationCommandOptionType.String,
				},
			],
		},
	],

	excute: async ({ client, interaction, options }) => {
		const subCommands = options.getSubcommand();
		const guild =
			client.guilds.cache.get(client.server.id) ||
			(await client.guilds.fetch(client.server.id));

		if (subCommands === 'close') {
			const currentTextChannel = interaction.channel as TextChannel;

			// Filtering out the channels
			if (
				currentTextChannel.guildId !== client.server.id ||
				currentTextChannel.parentId !== categoryId ||
				currentTextChannel.id === '885266382235795477' ||
				currentTextChannel.id === '880538350740725850'
			)
				return interaction.reply({
					embeds: [
						client.embeds.attention(
							'You may run this command in a ticket channel.'
						),
					],
					ephemeral: true,
				});

			// Fetching the user
			const user = await client.users.fetch(
				currentTextChannel.topic?.slice(
					currentTextChannel.topic?.length - client.user.id.length
				)
			);
			if (!user)
				return interaction.reply({
					embeds: [
						client.embeds.error(
							"I wasn't able to find the user, is the channel's topic changed?"
						),
					],
					ephemeral: true,
				});

			// Confirmation process
			const confirmationEmbed = client.util
				.embed()
				.setAuthor({
					name: client.user.username,
					iconURL: client.user.displayAvatarURL(),
				})
				.setTitle('Are you sure?')
				.setDescription(
					`Wait! This will close **${user.username}**'s modmail thread. Are you sure about continuing?`
				)
				.setColor(client.colors.wait);

			const sentInteraction = (await interaction.reply({
				embeds: [confirmationEmbed],
				components: [client.util.build.confirmationButtons('Close', 'Cancel')],
				fetchReply: true,
			})) as Message;

			const confirmationCollector = sentInteraction.createMessageComponentCollector({
				time: 20000,
				componentType: ComponentType.Button,
			});

			confirmationCollector.on('collect', async (collected) => {
				if (collected.user.id !== interaction.user.id)
					return collected.reply(client.cc.cannotInteract);
				collected.deferUpdate();

				switch (collected.customId) {
					case '2':
						confirmationCollector.stop('success');
						interaction.deleteReply();
						break;

					case '1':
						confirmationCollector.stop('success');

						// Deleting the thread
						const savingTrascriptEmbed = client.util
							.embed()
							.setAuthor({
								name: client.user.username,
								iconURL: client.user.displayAvatarURL(),
							})
							.setTitle('Saving the transcript')
							.setColor(client.colors.wait)
							.setDescription(
								'The transcript of the thread is getting saved... please wait.'
							);

						await interaction.editReply({
							embeds: [savingTrascriptEmbed],
							components: [],
						});

						// Generating the transcript
						const userId = currentTextChannel.topic.slice(
							currentTextChannel.topic.length - client.user.id.length
						);
						let fetchMessages = await interaction.channel.messages.fetch({
							limit: 100,
						});
						fetchMessages = fetchMessages.filter(
							(fetchedMessage) =>
								(fetchedMessage.author.bot &&
									fetchedMessage.author.id === client.user.id) ||
								!fetchedMessage.author.bot
						);
						let filtered = fetchMessages
							.sort((a, b) => a.createdTimestamp - b.createdTimestamp)
							.map((msg) => {
								if (msg.author.bot && msg.author.id === client.user.id) {
									if (msg.embeds[0]?.author?.url?.endsWith(userId)) {
										return `${msg.embeds[0]?.author.name} :: ${msg.embeds[0]?.description}`;
									}
								} else if (!msg.author.bot) {
									return `${msg?.author?.tag} :: ${msg?.content}`;
								}
							});

						const openedTickets = (await modmailModel.findById('substance'))
							.openedTickets;
						const ticketData = (openedTickets as ModmailTicketData[]).find(
							(data) => data.userId === userId
						);
						const transcript = await create(
							[
								{
									content: filtered.toString(),
									language: 'AsciiDoc',
								},
							],
							{
								title: `Modmail Transcript`,
								description: `Modmail Transcript for the user: ${user.tag}`,
							}
						);

						createModmailLog({
							action: ModmailActionType.Close,
							user: await client.users.fetch(userId),
							moderator: interaction.user,
							referencedCaseUrl: ticketData.url,
							transcript: transcript.url,
							ticketId: ticketData.id,
						});

						const transcriptSavedEmbed = client.util
							.embed()
							.setAuthor({
								name: client.user.username,
								iconURL: client.user.displayAvatarURL(),
							})
							.setTitle('Transcript Saved')
							.setColor(client.colors.success)
							.setDescription(
								`${client.cc.success} Trascript Saved! This channel is going to be deleted in 10 seconds!`
							);

						await interaction
							.editReply({ embeds: [transcriptSavedEmbed], components: [] })
							.then(() => {
								setTimeout(() => {
									interaction?.channel?.delete();
								}, 10000);
							});
						break;
				}
			});

			confirmationCollector.on('end', async (_, reason) => {
				if (reason === 'success') return;
				interaction.deleteReply();
			});
		} else if (subCommands === 'blacklist') {
			// Final user
			let user: User;
			let member = interaction.options.getMember('user');
			if (member) user = interaction.options.getUser('user');
			if (!member)
				user = (await client.users
					.fetch(options.getString('user-id'))
					.catch(() => {})) as User;

			if (!options.getString('user-id') && !options.getUser('user'))
				return interaction.reply({
					embeds: [
						client.embeds.attention('You have to enter a user or a user Id.'),
					],
					ephemeral: true,
				});
			if (!user || user === undefined)
				return interaction.reply({
					embeds: [client.embeds.error("A user with that ID wasn't found.")],
					ephemeral: true,
				});

			const findData = await modmailModel.findById(user.id);

			// Missing args
			if (!findData && !options.getString('reason'))
				return interaction.reply({
					embeds: [client.embeds.attention('You have to provide a reason.')],
					ephemeral: true,
				});

			const confirmationEmbed = client.util
				.embed()
				.setAuthor({
					name: client.user.username,
					iconURL: client.user.displayAvatarURL(),
				})
				.setTitle('Are you sure?')
				.setDescription(
					`Wait! This will ${
						findData ? 'remove the blacklist from ' : 'blacklist '
					} **${
						user.tag
					}** from opening modmail threads. Are you sure you want to continue?`
				)
				.setColor(client.colors.wait);

			const sentInteraction = (await interaction.reply({
				embeds: [confirmationEmbed],
				components: [client.util.build.confirmationButtons('Continue', 'Cancel')],
				fetchReply: true,
			})) as Message;
			const collector = sentInteraction.createMessageComponentCollector({
				time: 20000,
				componentType: ComponentType['Button'],
			});

			collector.on('collect', async (collected) => {
				if (collected.user.id !== interaction.user.id)
					return collected.reply(client.cc.cannotInteract);
				collector.stop('success');
				if (collected.customId === '2') return interaction.deleteReply();

				if (!findData) {
					const blacklistAdd = new modmailModel({
						_id: user.id,
						moderatorId: interaction.id,
						reason: options.getString('reason'),
						url: null,
					});
					blacklistAdd.save();

					await interaction.editReply({
						embeds: [
							client.embeds.success(
								`**${user.tag}** was added to the modmail blacklist.`
							),
						],
						components: [],
					});

					createModmailLog({
						action: ModmailActionType.BlacklistAdd,
						user: user,
						moderator: interaction.user,
						reason: options.getString('reason'),
					});
				} else if (findData) {
					await findData.delete();

					await interaction.editReply({
						embeds: [
							client.embeds.success(
								`**${user.tag}** was removed from the modmail blacklist.`
							),
						],
						components: [],
					});

					createModmailLog({
						action: ModmailActionType.BlacklistRemove,
						user: user,
						moderator: interaction.user,
						reason: options.getString('reason'),
					});
				}
			});

			collector.on('end', (_, reason) => {
				if (reason === 'success') return;
				interaction.deleteReply();
			});
		} else if (subCommands === 'open') {
			const user = options.getMember('user') as GuildMember;
			let canOpen: boolean = true;

			// Checking bot
			if (user.user.bot)
				return interaction.reply({
					embeds: [
						client.embeds.attention("You can't open modmail threads for bots."),
					],
					ephemeral: true,
				});

			// Checking already exists
			const guildCategory = client.guilds.cache
				.get(client.server.id)
				.channels.cache.get(categoryId) as CategoryChannel;
			const findExisting = guildCategory.children.cache.find(
				/* child? sus af */ (child: TextChannel) =>
					child.topic?.slice(child.topic?.length - client.user.id.length) === user.id
			);

			if (findExisting)
				return interaction.reply({
					embeds: [
						client.embeds.attention(
							'Looks like this user already has a thread opened at ' +
								findExisting.toString()
						),
					],
					ephemeral: true,
				});

			// Checking blacklist
			const data = await modmailModel.findById(user.id);
			if (data)
				return interaction.reply({
					embeds: [
						client.util.embed({
							description: `${user.user.tag} is blacklisted from opening modmails.`,
							color: client.colors.error,
						}),
					],
					ephemeral: true,
				});

			const openedModmailEmbed = client.util
				.embed()
				.setAuthor({ name: guild.name, iconURL: guild.iconURL() })
				.setTitle('Modmail opened')
				.setColor(client.util.resolve.color('Yellow'))
				.setDescription(
					[
						'A wild ticket has appeared!',
						`You've received a direct modmail from a moderator in **${guild.name}**.`,
						"If you're wondering of how this ticket got opened, be patient until the moderator contact from within this ticket.",
					].join('\n')
				);

			if (options?.getString('reason'))
				openedModmailEmbed.addFields({
					name: 'Reason',
					value: options?.getString('reason'),
				});

			user.user
				.send({ embeds: [openedModmailEmbed] })
				.catch(() => {
					canOpen = false;
				})
				.then(async () => {
					switch (canOpen) {
						case false:
							interaction.reply({
								embeds: [
									client.embeds.error(
										"This user doesn't accept direct messages or has blacked the bot. Could not open the modmail."
									),
								],
								ephemeral: true,
							});
							break;

						case true:
							await interaction.reply({
								embeds: [
									client.util.embed({
										description:
											"Please wait while we're trying to set this ticket up...",
										color: client.colors.wait,
									}),
								],
							});

							const threadChannel = await guild.channels.create(
								user.user.username,
								{
									type: ChannelType.GuildText,
									parent: categoryId,
									topic: `[Moderator]: ${interaction.user.tag} - Thread Created for ${user.user.tag} - ID: ${user.user.id}`,
									reason: `Modmail thread created for ${user.user.tag} by ${interaction.user.tag}`,
								}
							);

							const threadChannelFirstEmbed = client.util
								.embed()
								.setAuthor({
									name: user.user.tag,
									iconURL: user.user.displayAvatarURL(),
								})
								.setColor(client.colors.ultimates)
								.setDescription(`${user.user} • ID: ${user.user.id}`)
								.setThumbnail(user.user.displayAvatarURL())
								.addFields(
									{
										name: 'Account Information',
										value: [
											`• **Username:** ${user.user.tag}`,
											`• **ID:** ${user.user.id}`,
											`• **Registered:** <t:${~~(
												+user.user.createdAt / 1000
											)}:f> | <t:${~~(
												+user.user.createdAt / 1000
											)}:R>`,
										].join('\n'),
									},
									{
										name: 'Server Information',
										value: [
											`• **Joined**: <t:${~~(
												+user.joinedAt / 1000
											)}:f> | <t:${~~(+user.joinedAt / 1000)}:R>`,
											`• **Nickname**: ${
												user.user.username == user.displayName
													? `No Nickname`
													: user.displayName
											}`,
										].join('\n'),
									}
								);

							await threadChannel.send({ embeds: [threadChannelFirstEmbed] });

							// Deleting any cooldowns from past
							modmailCooldown.delete(`create-new-on-close_${user.user.id}`);

							await interaction.editReply({
								embeds: [
									client.embeds.success(
										`Thread was created at ${threadChannel}`
									),
								],
							});

							createModmailLog({
								action: ModmailActionType.Open,
								ticketId: await getModmailCase(),
								user: user.user,
								moderator: interaction.user,
								ticket: { type: 'DIRECT', channel: threadChannel },
								reason: options.getString('reason'),
							});
							break;
					}
				});
		}
	},
});
