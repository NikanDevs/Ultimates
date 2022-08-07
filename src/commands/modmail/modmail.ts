import { ChannelType, GuildMember, TextChannel, CategoryChannel, EmbedBuilder, Colors } from 'discord.js';
import { create } from 'sourcebin';
import { modmailCooldown } from '../../events/modmail/messageCreate';
import { getModmailTicket } from '../../functions/cases/modmailCase';
import { createModmailLog } from '../../functions/logs/createModmailLog';
import { modmailModel } from '../../models/modmail';
import { Command } from '../../structures/Command';
import { ModmailActionTypes } from '../../typings';
import { generateModmailInfoEmbed } from '../../utils/generateModmailInfoEmbed';
import { interactions } from '../../interactions';
import { t } from 'i18next';

export default new Command({
	interaction: interactions.modmail,
	excute: async ({ client, interaction, options }) => {
		const subcommand = options.getSubcommand();
		const guild = client.guilds.cache.get(process.env.GUILD_ID);

		if (subcommand === 'close') {
			const textChannel = interaction.channel as TextChannel;

			if (textChannel.parentId !== client.config.general.modmailCategoryId)
				return interaction.reply({
					embeds: [client.embeds.attention(t('command.modmail.modmail.close.invalidChannel'))],
					ephemeral: true,
				});

			const user = await client.users.fetch(
				textChannel.topic?.split('|')[textChannel.topic.split('|').length - 1].replace('ID:', '').trim()
			);

			if (!user)
				return interaction.reply({
					embeds: [client.embeds.error(t('command.modmail.modmail.close.invalidUser'))],
					ephemeral: true,
				});

			await interaction.deferReply();
			const userId = textChannel.topic
				?.split('|')
				[textChannel.topic.split('|').length - 1].replace('ID:', '')
				.trim();

			let fetchMessages = await interaction.channel.messages.fetch({
				limit: 100,
			});
			fetchMessages = fetchMessages.filter(
				(fetchedMessage) => !fetchedMessage.author.bot || fetchedMessage.author.id === client.user.id
			);

			let filtered = fetchMessages
				.sort((a, b) => a.createdTimestamp - b.createdTimestamp)
				.map((msg) => {
					if (msg.author.bot && msg.author.id !== client.user.id) return 'LINE_BREAK';
					if (msg.author.id === client.user.id) {
						if (!msg.embeds[0]?.author?.url?.endsWith(userId)) return 'LINE_BREAK';
						return `${msg.embeds[0]?.author.name} :: ${msg.embeds[0]?.description || 'No content.'}`;
					} else if (!msg.author.bot) {
						return `${msg?.author?.tag} :: ${msg?.content || 'No content.'}`;
					}
				})
				.join('\n')
				.replaceAll('LINE_BREAK', '');

			const openedTickets = (await modmailModel.findById('substance')).openedTickets;
			const ticketData = openedTickets.find((data) => data.userId === userId);

			const transcript = await create(
				[
					{
						content: filtered.toString(),
						language: 'AsciiDoc',
					},
				],
				{
					title: t('command.modmail.modmail.close.transcript', { context: 'title' }),
					description: t('command.modmail.modmail.close.transcript', {
						context: 'description',
						user: user.tag,
					}),
				}
			);

			await createModmailLog({
				action: ModmailActionTypes.Close,
				user: await client.users.fetch(userId),
				moderator: interaction.user,
				referencedCaseUrl: ticketData.url,
				transcript: transcript.url,
				ticketId: ticketData.id,
			});

			await interaction
				.followUp({
					embeds: [client.embeds.attention(t('command.modmail.modmail.close.deleting'))],
					components: [],
				})
				.then(() => {
					setTimeout(() => {
						interaction?.channel?.delete();

						const closedEmbed = new EmbedBuilder()
							.setAuthor({ name: guild.name, iconURL: guild.iconURL() })
							.setTitle(t('command.modmail.modmail.close.embed', { context: 'title' }))
							.setDescription(t('command.modmail.modmail.close.embed', { context: 'description' }))
							.setColor(Colors.Red);
						user?.send({ embeds: [closedEmbed] }).catch(() => {});

						modmailCooldown.set(`open_${user?.id}`, Date.now() + 600000);
						setTimeout(() => {
							modmailCooldown.delete(`open_${user?.id}`);
						}, 600000);
					}, 10000);
				});
		} else if (subcommand === 'blacklist') {
			const user = options.getUser('user');
			const reason = options.getString('reason');
			const findData = await modmailModel.findById(user.id);

			if (!findData && !options.getString('reason'))
				return interaction.reply({
					embeds: [client.embeds.attention(t('command.modmail.modmail.blacklist.invalidReason'))],
					ephemeral: true,
				});

			if (!findData) {
				const blacklistAdd = new modmailModel({
					_id: user.id,
					moderatorId: interaction.id,
					reason,
					url: null,
				});
				blacklistAdd.save();

				await interaction.reply({
					embeds: [
						client.embeds.success(t('command.modmail.modmail.blacklist.added', { user: user.tag })),
					],
					components: [],
				});

				createModmailLog({
					action: ModmailActionTypes.BlacklistAdd,
					user: user,
					moderator: interaction.user,
					reason,
				});
			} else if (findData) {
				await findData.delete();

				await interaction.reply({
					embeds: [
						client.embeds.success(t('command.modmail.modmail.blacklist.removed', { user: user.tag })),
					],
					components: [],
				});

				createModmailLog({
					action: ModmailActionTypes.BlacklistRemove,
					user: user,
					moderator: interaction.user,
					reason,
					referencedCaseUrl: findData.url,
				});
			}
		} else if (subcommand === 'open') {
			const member = options.getMember('user') as GuildMember;
			if (!member)
				return interaction.reply({
					embeds: [client.embeds.error(t('common.errors.invalidMember'))],
					ephemeral: true,
				});

			let canOpen: boolean = true;

			if (member.user.bot)
				return interaction.reply({
					embeds: [client.embeds.attention(t('command.modmail.modmail.open.notBot'))],
					ephemeral: true,
				});

			// Checking already exists
			const category = client.guilds.cache
				.get(process.env.GUILD_ID)
				.channels.cache.get(client.config.general.modmailCategoryId) as CategoryChannel;

			const findExisting = category.children.cache.find(
				/* child? sus af */ (child: TextChannel) =>
					child.topic?.split('|')[child.topic.split('|').length - 1].replace('ID:', '').trim() ===
					member.id
			);

			if (findExisting)
				return interaction.reply({
					embeds: [
						client.embeds.attention(
							t('command.modmail.modmail.open.exists', { channel: findExisting.toString() })
						),
					],
					ephemeral: true,
				});

			// Checking blacklist
			const data = await modmailModel.findById(member.id);
			if (data)
				return interaction.reply({
					embeds: [
						client.embeds.attention(
							t('command.modmail.modmail.open.blacklisted', { user: member.user.tag })
						),
					],
					ephemeral: true,
				});

			const openedModmailEmbed = new EmbedBuilder()
				.setAuthor({ name: guild.name, iconURL: guild.iconURL() })
				.setTitle(t('command.modmail.modmail.open.embed', { context: 'title' }))
				.setColor(Colors.Yellow)
				.setDescription(
					t('command.modmail.modmail.open.embed', { context: 'description', guild: guild.name })
				);
			if (options?.getString('reason'))
				openedModmailEmbed.addFields([
					{
						name: t('command.modmail.modmail.open.embed', { context: 'reason' }),
						value: options.getString('reason'),
					},
				]);

			member.user
				.send({ embeds: [openedModmailEmbed] })
				.catch(() => {
					canOpen = false;
				})
				.then(async () => {
					switch (canOpen) {
						case false:
							interaction.reply({
								embeds: [client.embeds.error(t('command.modmail.modmail.open.cantDM'))],
								ephemeral: true,
							});
							break;

						case true:
							await interaction.reply({
								embeds: [
									new EmbedBuilder({
										description: t('command.modmail.modmail.open.opening'),
										color: Colors.Yellow,
									}),
								],
							});

							const threadChannel = await guild.channels.create({
								name: member.user.username,
								type: ChannelType.GuildText,
								parent: client.config.general.modmailCategoryId,
								// No i18n since the string structure is a key
								topic: `A tunnel to contact **${member.user.username}**, ${interaction.user.username} requested this ticket to be opened using /modmail open | ID: ${member.id}`,
							});

							await threadChannel.send({
								embeds: [await generateModmailInfoEmbed(member.user)],
							});

							// Deleting any cooldowns from past
							modmailCooldown.delete(`open_${member.user.id}`);

							await interaction.editReply({
								embeds: [
									client.embeds.success(
										t('command.modmail.modmail.open.opened', {
											channel: threadChannel.toString(),
										})
									),
								],
							});

							createModmailLog({
								action: ModmailActionTypes.Open,
								ticketId: await getModmailTicket(),
								user: member.user,
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
