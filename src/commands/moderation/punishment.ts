import { ApplicationCommandOptionType, ComponentType, Message, User } from 'discord.js';
import { durationsModel } from '../../models/durations';
import { punishmentModel } from '../../models/punishments';
import { Command } from '../../structures/Command';
import { automodModel } from '../../models/automod';
import { logsModel } from '../../models/logs';
import { lengths } from '../../json/moderation.json';
import { PunishmentType } from '../../typings/PunishmentType';
import { createModLog } from '../../functions/logs/createModLog';
import { generateDiscordTimestamp } from '../../utils/generateDiscordTimestamp';

export default new Command({
	name: 'punishment',
	description: 'Punishment command subcommands.',
	directory: 'moderation',
	cooldown: 3000,
	permission: ['ManageMessages'],
	options: [
		{
			name: 'revoke',
			description: 'Revokes a punishment.',
			type: ApplicationCommandOptionType['Subcommand'],
			options: [
				{
					name: 'id',
					description: 'The Id of the punishment you wish to revoke.',
					required: true,
					type: ApplicationCommandOptionType['String'],
					autocomplete: true,
				},
				{
					name: 'reason',
					description: "The reason that you're revoking",
					required: false,
					type: ApplicationCommandOptionType['String'],
				},
			],
		},
		{
			name: 'search',
			description: 'Search for a punishment.',
			type: ApplicationCommandOptionType['Subcommand'],
			options: [
				{
					name: 'id',
					description: 'The Id of the punishment you wish to find.',
					required: true,
					type: ApplicationCommandOptionType['String'],
					autocomplete: true,
				},
			],
		},
		{
			name: 'view',
			description: 'View all the punishments recorded for a user.',
			type: ApplicationCommandOptionType['Subcommand'],
			options: [
				{
					name: 'user',
					description: 'The user you want to view their punishments.',
					required: false,
					type: ApplicationCommandOptionType['User'],
				},
				{
					name: 'user-id',
					description: 'The id of the user you want to view their punishments.',
					required: false,
					type: ApplicationCommandOptionType['String'],
				},
			],
		},
	],

	excute: async ({ client, interaction, options }) => {
		const getSubCommand = options.getSubcommand();

		if (getSubCommand === 'revoke') {
			const warnId = options.getString('id');
			const reason = options.getString('reason') || 'No reason was provided.';

			const data =
				warnId.length === lengths['automod-id']
					? await automodModel.findById(warnId).catch(() => {})
					: await punishmentModel.findById(warnId).catch(() => {});
			if (!data)
				return interaction.reply({
					embeds: [client.embeds.error('No punishment with that ID was found.')],
					ephemeral: true,
				});

			await interaction.deferReply();
			const getMember = interaction.guild.members.cache.get(data.userId);
			const fetchUser = await client.users.fetch(data.userId);
			switch (data.type) {
				case PunishmentType.Timeout:
					if (
						await durationsModel.findOne({
							type: PunishmentType.Timeout,
							userId: data.userId,
						})
					) {
						if (getMember)
							getMember.timeout(null, 'Mute ended based on the duration.');

						await interaction.followUp({
							embeds: [
								client.embeds.success(
									`Punishment **${warnId}** was revoked.`
								),
							],
						});

						await createModLog({
							action: PunishmentType.Unmute,
							user: fetchUser,
							moderator: interaction.user,
							reason: '[Revoke]: ' + reason,
							referencedPunishment: data,
						}).then(async () => {
							await durationsModel.findOneAndDelete({
								type: PunishmentType.Timeout,
								case: data.case,
							});
							await logsModel.findByIdAndDelete(data.case);
							data.delete();
						});
					} else {
						await interaction.followUp({
							embeds: [
								client.embeds.success(
									`Punishment **${warnId}** was revoked.`
								),
							],
						});

						await createModLog({
							action: data.type as PunishmentType,
							user: fetchUser,
							moderator: interaction.user,
							reason: reason,
							referencedPunishment: data,
							revoke: true,
						}).then(async () => {
							await logsModel.findByIdAndDelete(data.case);
							data.delete();
						});
					}
					break;
				case PunishmentType.Ban:
				case PunishmentType.Softban:
					if (await interaction.guild.bans.fetch(data.userId).catch(() => {})) {
						interaction.guild.members.unban(fetchUser, reason);

						if (data.type === PunishmentType.Softban)
							await durationsModel.findOneAndDelete({
								type: PunishmentType.Softban,
								case: data.case,
							});

						await interaction.followUp({
							embeds: [
								client.embeds.success(
									`Punishment **${warnId}** was revoked.`
								),
							],
						});

						await createModLog({
							action: PunishmentType.Unban,
							user: fetchUser,
							moderator: interaction.user,
							reason: '[Revoke]: ' + reason,
							referencedPunishment: data,
						}).then(async () => {
							await logsModel.findByIdAndDelete(data.case);
							data.delete();
						});
					} else {
						await interaction.followUp({
							embeds: [
								client.embeds.success(
									`Punishment **${warnId}** was **revoked**.`
								),
							],
						});

						await createModLog({
							action: data.type as PunishmentType,
							user: fetchUser,
							moderator: interaction.user,
							reason: reason,
							referencedPunishment: data,
							revoke: true,
						}).then(async () => {
							await logsModel.findByIdAndDelete(data.case);
							data.delete();
						});
					}
					break;
				default:
					await interaction.followUp({
						embeds: [
							client.embeds.success(`Punishment **${warnId}** was revoked.`),
						],
					});

					await createModLog({
						action: data.type as PunishmentType,
						user: fetchUser,
						moderator: interaction.user,
						reason: reason,
						referencedPunishment: data,
						revoke: true,
					}).then(async () => {
						await logsModel.findByIdAndDelete(data.case);
						data.delete();
					});
					break;
			}
		} else if (getSubCommand === 'search') {
			let doesExist: boolean = true;
			const warnId = options.getString('id');
			const baseEmbed = client.util.embed().setColor(client.colors.invisible);

			switch (warnId.length) {
				case lengths['automod-id']:
					await automodModel
						.findById(warnId)
						.catch(() => (doesExist = false))
						.then(async (automodWarn) => {
							// If there is no data
							if (!automodWarn) return (doesExist = false);

							const getUser = (await client.users
								.fetch(automodWarn.userId)
								.catch(() => {})) as User;

							baseEmbed
								.setDescription(
									`ID: \`${warnId}\` • Case: ${automodWarn.case}`
								)
								.setAuthor({
									name: client.user.username,
									iconURL: client.user.displayAvatarURL(),
								})
								.addFields(
									{
										name: 'Type',
										value: `Automod ${client.util.capitalize(
											automodWarn.type
										)}`,
										inline: true,
									},
									{
										name: 'Date & Time',
										value: generateDiscordTimestamp(
											automodWarn.date,
											'Short Date/Time'
										),
										inline: true,
									},
									{
										name: 'Expire',
										value: generateDiscordTimestamp(
											automodWarn.expire
										),
										inline: true,
									},
									{
										name: 'User',
										value: getUser.toString(),
										inline: true,
									},
									{
										name: 'User Tag',
										value: getUser.tag,
										inline: true,
									},
									{
										name: 'User Id',
										value: automodWarn.userId,
										inline: true,
									},
									{
										name: 'Reason',
										value: automodWarn.reason,
										inline: true,
									}
								);
						});
					break;
				case lengths['manual-id']:
					await punishmentModel
						.findById(warnId)
						.catch(() => (doesExist = false))
						.then(async (manualWarn) => {
							// If there is no data
							if (!manualWarn) return (doesExist = false);

							const getUser = (await client.users
								.fetch(manualWarn.userId)
								.catch(() => {})) as User;
							const getMod = (await client.users
								.fetch(manualWarn.moderatorId)
								.catch(() => {})) as User;

							baseEmbed
								.setDescription(
									`ID: \`${warnId}\` • Case: ${manualWarn.case}`
								)
								.setAuthor({
									name: client.user.username,
									iconURL: client.user.displayAvatarURL(),
								})
								.addFields(
									{
										name: 'Type',
										value: `Manual ${client.util.capitalize(
											manualWarn.type
										)}`,
										inline: true,
									},
									{
										name: 'Date & Time',
										value: generateDiscordTimestamp(
											manualWarn.date,
											'Short Date/Time'
										),
										inline: true,
									},
									{
										name: 'Expire',
										value: generateDiscordTimestamp(
											manualWarn.expire
										),
										inline: true,
									},
									{
										name: 'User',
										value: getUser.toString(),
										inline: true,
									},
									{
										name: 'User Tag',
										value: getUser.tag,
										inline: true,
									},
									{
										name: 'User Id',
										value: manualWarn.userId,
										inline: true,
									},
									{
										name: 'Moderator',
										value: getMod.toString(),
										inline: true,
									},
									{
										name: 'Moderator Tag',
										value: getMod.tag,
										inline: true,
									},
									{
										name: 'Moderator Id',
										value: manualWarn.moderatorId,
										inline: true,
									},
									{
										name: 'Reason',
										value: manualWarn.reason,
										inline: true,
									}
								);
						});
					break;
				default:
					doesExist = false;
					break;
			}

			if (!doesExist)
				return interaction.reply({
					embeds: [client.embeds.error('No punishment with that ID was found.')],
					ephemeral: true,
				});

			interaction.reply({ embeds: [baseEmbed] });
		} else if (getSubCommand === 'view') {
			// Catching the proper user
			let user: User;
			let member = options.getMember('user');
			if (member) user = options.getUser('user');
			if (!interaction.options.getMember('user') && !options.getString('user-id')) {
				(member = interaction.member), (user = interaction.user);
			}
			if (!member)
				user = (await client.users
					.fetch(options.getString('user-id'))
					.catch(() => {})) as User;
			if (user === null || user === undefined)
				return interaction.reply({
					embeds: [
						client.embeds.error("I wasn't able to find a user with that ID."),
					],
					ephemeral: true,
				});

			// Getting all the warnings
			var warningsArray: string[] = [];
			const findWarningsNormal = await punishmentModel.find({ userId: user.id });
			const findWarningsAutomod = await automodModel.find({ userId: user.id });
			let warnCounter = 0;

			findWarningsNormal.forEach((data) => {
				warnCounter = warnCounter + 1;
				warningsArray.push(
					[
						`\`${warnCounter}\` **${client.util.capitalize(
							data.type
						)}** | **ID: ${data._id}**`,
						`• **Date:** ${generateDiscordTimestamp(
							data.date,
							'Short Date/Time'
						)}`,
						client.users.cache.get(data.moderatorId) === undefined
							? `• **Moderator ID:** ${data.moderatorId}`
							: `• **Moderator:** ${
									client.users.cache.get(data.moderatorId).tag
							  }`,
						data.type === 'WARN'
							? `• **Expire:** ${generateDiscordTimestamp(data.expire)}`
							: 'LINE_BREAK',
						`• **Reason:** ${data.reason}`,
					]
						.join('\n')
						.replaceAll('\nLINE_BREAK', '')
				);
			});
			findWarningsAutomod.forEach((data) => {
				warnCounter = warnCounter + 1;
				warningsArray.push(
					[
						`\`${warnCounter}\` **${client.util.capitalize(
							data.type
						)}** | Auto Moderation`,
						`• **Date:** ${generateDiscordTimestamp(
							data.date,
							'Short Date/Time'
						)}`,
						data.type === 'WARN'
							? `• **Expire:** ${generateDiscordTimestamp(data.expire)}`
							: 'LINE_BREAK',
						`• **Reason:** ${data.reason}`,
					]
						.join('\n')
						.replaceAll('\nLINE_BREAK', '')
				);
			});

			const warningsEmbed = client.util
				.embed()
				.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
				.setColor(client.colors.invisible)
				.setThumbnail(user.displayAvatarURL());

			// Sending the results
			if (warningsArray.length === 0)
				return interaction.reply({
					embeds: [
						client.util.embed({
							description: `No punishments were found for **${user.tag}**`,
							color: client.colors.invisible,
						}),
					],
					ephemeral: true,
				});

			await interaction.deferReply();
			if (warningsArray.length <= 3) {
				warningsEmbed.setDescription(
					warningsArray.map((data) => data.toString()).join('\n\n')
				);
				interaction.followUp({ embeds: [warningsEmbed] });
			} else if (warningsArray.length > 3) {
				const totalPages = Math.ceil(warningsArray.length / 3);
				let currentSlice1 = 0;
				let currentSlice2 = 3;
				let currentPage = 1;
				let sliced = warningsArray
					.map((data) => data.toString())
					.slice(currentSlice1, currentSlice2);

				warningsEmbed
					.setDescription(sliced.join('\n\n'))
					.setFooter({ text: `Page ${currentPage}/${totalPages}` });
				var sentInteraction = (await interaction.followUp({
					embeds: [warningsEmbed],
					components: [client.util.build.paginator()],
				})) as Message;

				const collector = sentInteraction.createMessageComponentCollector({
					time: 60000,
					componentType: ComponentType['Button'],
				});

				collector.on('collect', (collected) => {
					if (interaction.user.id !== collected.user.id)
						return collected.reply(client.cc.cannotInteract);

					switch (collected.customId) {
						case '1':
							if (currentPage === 1) return collected.deferUpdate();

							currentSlice1 = currentSlice1 - 3;
							currentSlice2 = currentSlice2 - 3;
							currentPage = currentPage - 1;
							sliced = warningsArray
								.map((data) => data.toString())
								.slice(currentSlice1, currentSlice2);
							warningsEmbed
								.setDescription(
									sliced.map((data) => data.toString()).join('\n\n')
								)
								.setFooter({ text: `Page ${currentPage}/${totalPages}` });

							interaction.editReply({ embeds: [warningsEmbed] });
							collected.deferUpdate();
							break;
						case '2':
							if (currentPage === totalPages) return collected.deferUpdate();

							currentSlice1 = currentSlice1 + 3;
							currentSlice2 = currentSlice2 + 3;
							currentPage = currentPage + 1;
							sliced = warningsArray
								.map((data) => data.toString())
								.slice(currentSlice1, currentSlice2);
							warningsEmbed
								.setDescription(
									sliced.map((data) => data.toString()).join('\n\n')
								)
								.setFooter({ text: `Page ${currentPage}/${totalPages}` });

							interaction.editReply({ embeds: [warningsEmbed] });
							collected.deferUpdate();
							break;
					}
				});

				collector.on('end', () => {
					interaction.editReply({ components: [] });
				});
			}
		}
	},
});
