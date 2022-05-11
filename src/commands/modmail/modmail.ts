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
import { generateModmailInfoEmbed } from '../../utils/generateModmailInfoEmbed';

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

			if (
				currentTextChannel.guildId !== client.server.id ||
				currentTextChannel.parentId !== categoryId ||
				currentTextChannel.id === '885266382235795477' ||
				currentTextChannel.id === '880538350740725850'
			)
				return interaction.reply({
					embeds: [
						client.embeds.attention(
							'You should run this command in a ticket channel.'
						),
					],
					ephemeral: true,
				});

			const user = await client.users.fetch(
				currentTextChannel.topic?.slice(
					currentTextChannel.topic?.length - client.user.id.length
				)
			);
			if (!user)
				return interaction.reply({
					embeds: [client.embeds.error("I wasn't able to find the user.")],
					ephemeral: true,
				});

			await interaction.deferReply();
			const userId = currentTextChannel.topic.slice(
				currentTextChannel.topic.length - client.user.id.length
			);
			let fetchMessages = await interaction.channel.messages.fetch({
				limit: 100,
			});
			fetchMessages = fetchMessages.filter(
				(fetchedMessage) =>
					!fetchedMessage.author.bot || fetchedMessage.author.id === client.user.id
			);

			let filtered = fetchMessages
				.sort((a, b) => a.createdTimestamp - b.createdTimestamp)
				.map((msg) => {
					if (msg.author.bot && msg.author.id !== client.user.id) return 'FORCESKIP';
					if (msg.author.id === client.user.id) {
						if (!msg.embeds[0]?.author?.url?.endsWith(userId)) return 'FORCESKIP';
						return `${msg.embeds[0]?.author.name} :: ${
							msg.embeds[0]?.description || 'No content.'
						}`;
					} else if (!msg.author.bot) {
						return `${msg?.author?.tag} :: ${msg?.content || 'No content.'}`;
					}
				})
				.join('\n')
				.replaceAll('FORCESKIP', '');

			const openedTickets = (await modmailModel.findById('substance')).openedTickets;
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

			await interaction
				.followUp({
					embeds: [
						client.embeds.attention(
							'This ticket is going to be deleted in 10 seconds...'
						),
					],
					components: [],
				})
				.then(() => {
					setTimeout(() => {
						interaction?.channel?.delete();

						const closedEmbed = client.util
							.embed()
							.setAuthor({ name: guild.name, iconURL: guild.iconURL() })
							.setTitle('Ticket closed')
							.setDescription(
								'Your ticket was closed by a staff member. If you got other questions in the future, feel free to ask them!'
							)
							.setColor(client.util.resolve.color('Red'));
						user?.send({ embeds: [closedEmbed] }).catch(() => {});

						modmailCooldown.set(`open_${user?.id}`, Date.now() + 600000);
						setTimeout(() => {
							modmailCooldown.delete(`open_${user?.id}`);
						}, 600000);
					}, 10000);
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

			if (!findData && !options.getString('reason'))
				return interaction.reply({
					embeds: [client.embeds.attention('You have to provide a reason.')],
					ephemeral: true,
				});

			if (!findData) {
				const blacklistAdd = new modmailModel({
					_id: user.id,
					moderatorId: interaction.id,
					reason: options.getString('reason'),
					url: null,
				});
				blacklistAdd.save();

				await interaction.reply({
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

				await interaction.reply({
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
							'Looks like this user already has a ticket opened at ' +
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
						'**A wild ticket has appeared!**',
						`You've received a direct modmail from a staff member in **${guild.name}**. If you're wondering of how this ticket got opened, be patient until the moderator contact from through this ticket.`,
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
									topic: `A tunnel to contact **${user.user.username}**, ${interaction.user.username} requested this ticket to be opened using /modmail open | ID: ${user.id}`,
									reason: `Direct modmail thread opened.`,
								}
							);
							await threadChannel.send({
								embeds: [await generateModmailInfoEmbed(user.user)],
							});

							// Deleting any cooldowns from past
							modmailCooldown.delete(`open_${user.user.id}`);

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
