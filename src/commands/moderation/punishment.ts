import { ComponentType, EmbedBuilder, Message, TextChannel, User } from 'discord.js';
import { durationsModel } from '../../models/durations';
import { punishmentModel } from '../../models/punishments';
import { Command } from '../../structures/Command';
import { automodModel } from '../../models/automod';
import { logsModel } from '../../models/logs';
import { interactions } from '../../interactions';
import { PunishmentType } from '../../typings/PunishmentType';
import { createModLog, getUrlFromCase } from '../../functions/logs/createModLog';
import { generateDiscordTimestamp } from '../../utils/generateDiscordTimestamp';
import { convertTime } from '../../functions/convertTime';
import { AUTOMOD_ID_LENGTH, PUNISHMENT_ID_LENGTH } from '../../constants';

export default new Command({
	interaction: interactions.punishment,
	excute: async ({ client, interaction, options }) => {
		const getSubCommand = options.getSubcommand();

		if (getSubCommand === 'revoke') {
			const warnId = options.getString('id');
			const reason = options.getString('reason') || 'No reason was provided.';

			const data =
				warnId.length == AUTOMOD_ID_LENGTH
					? await automodModel.findById(warnId).catch(() => {})
					: await punishmentModel.findById(warnId).catch(() => {});
			if (!data)
				return interaction.reply({
					embeds: [client.embeds.error('No punishment with that ID was found.')],
					ephemeral: true,
				});

			await interaction.deferReply({ ephemeral: true });
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
							reason: reason,
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
							reason: reason,
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
			const baseEmbed = new EmbedBuilder().setColor(client.cc.invisible);

			switch (warnId.length) {
				case AUTOMOD_ID_LENGTH:
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
								.addFields([
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
									},
								]);
						});
					break;
				case PUNISHMENT_ID_LENGTH:
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
								.addFields([
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
									},
								]);
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
			const user = options.getUser('user');

			// Getting all the warnings
			const findWarningsNormal = await punishmentModel.find({ userId: user.id });
			const findWarningsAutomod = await automodModel.find({ userId: user.id });
			let warnCounter = 0;

			const warnings = findWarningsNormal
				.map((data) => {
					warnCounter = warnCounter + 1;
					return [
						`\`${warnCounter}\` **${client.util.capitalize(
							data.type
						)}** | **ID: ${data._id}**`,
						`• **Date:** ${generateDiscordTimestamp(
							data.date,
							'Short Date/Time'
						)}`,
						data.moderatorId === client.user.id
							? `• **Moderator:** Automatic`
							: client.users.cache.get(data.moderatorId) === undefined
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
						.replaceAll('\nLINE_BREAK', '');
				})
				.concat(
					findWarningsAutomod.map((data) => {
						warnCounter = warnCounter + 1;
						return [
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
							.replaceAll('\nLINE_BREAK', '');
					})
				);

			const warningsEmbed = new EmbedBuilder()
				.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
				.setColor(client.cc.invisible)
				.setThumbnail(user.displayAvatarURL());

			// Sending the results
			if (warnings.length === 0)
				return interaction.reply({
					embeds: [
						new EmbedBuilder({
							description: `No punishments were found for **${user.tag}**`,
							color: client.cc.invisible,
						}),
					],
					ephemeral: true,
				});

			await interaction.deferReply();
			if (warnings.length <= 3) {
				warningsEmbed.setDescription(
					warnings.map((data) => data.toString()).join('\n\n')
				);
				interaction.followUp({ embeds: [warningsEmbed] });
			} else if (warnings.length > 3) {
				const totalPages = Math.ceil(warnings.length / 3);
				let currentSlice1 = 0;
				let currentSlice2 = 3;
				let currentPage = 1;
				let sliced = warnings
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

				collector.on('collect', (collected): any => {
					if (interaction.user.id !== collected.user.id)
						return collected.reply({
							content: 'You can not use this.',
							ephemeral: true,
						});

					switch (collected.customId) {
						case '1':
							if (currentPage === 1) return collected.deferUpdate();

							currentSlice1 = currentSlice1 - 3;
							currentSlice2 = currentSlice2 - 3;
							currentPage = currentPage - 1;
							sliced = warnings
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
							sliced = warnings
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
		} else if (getSubCommand === 'update') {
			const value = options.getNumber('value');
			const id = options.getString('id');
			const newvalue = options.getString('new-value');
			let punishment: any = null;

			await interaction.deferReply({ ephemeral: true });
			switch (id.length) {
				case PUNISHMENT_ID_LENGTH:
					punishment = await punishmentModel.findById(id).catch(() => {});
					break;
				case AUTOMOD_ID_LENGTH:
					punishment = await automodModel.findById(id).catch(() => {});
					break;
			}

			if (!punishment || punishment === undefined)
				return interaction.followUp({
					embeds: [client.embeds.error('No punishment with that ID was found.')],
					ephemeral: true,
				});

			const duration = /^\d+$/.test(newvalue)
				? parseInt(newvalue)
				: +convertTime(newvalue);
			switch (value) {
				case 1:
					if (
						!(await interaction.guild.members
							.fetch(punishment.userId)
							.catch(() => {})) &&
						punishment.type === PunishmentType.Timeout
					)
						return interaction.followUp({
							embeds: [
								client.embeds.error(
									'The punished user is not in the server. I can not update the timeout.'
								),
							],
						});

					if (
						punishment.type == PunishmentType.Timeout ||
						punishment.type === PunishmentType.Softban
					) {
						if (duration === undefined)
							return interaction.followUp({
								embeds: [
									client.embeds.error(
										`The provided duration must be in ${
											punishment.type === PunishmentType.Softban
												? `1y, 1mo, 1w, 1h, 1m`
												: `1w, 1h, 1d, 1m, 10s`
										} format.`
									),
								],
								ephemeral: true,
							});

						if (
							duration > 1000 * 60 * 60 * 24 * 27 ||
							(duration < 10000 && punishment.type === PunishmentType.Timeout)
						)
							return interaction.followUp({
								embeds: [
									client.embeds.attention(
										'The duration must be between 10 seconds and 27 days.'
									),
								],
								ephemeral: true,
							});

						if (
							duration > 1000 * 60 * 60 * 24 * 365 ||
							(duration < 60000 && punishment.type === PunishmentType.Softban)
						)
							return interaction.followUp({
								embeds: [
									client.embeds.attention(
										'The duration must be between 1 minute and 1 year.'
									),
								],
								ephemeral: true,
							});

						const findDuration = await durationsModel.findOne({
							case: punishment.case,
						});

						if (!findDuration)
							return interaction.followUp({
								embeds: [
									client.embeds.error(
										'The duration of this punishment has already ended.'
									),
								],
								ephemeral: true,
							});

						if (duration === findDuration.duration)
							return interaction.followUp({
								embeds: [
									client.embeds.attention(
										'Try updating the duration to a value that is not the same as the current one.'
									),
								],
							});

						await durationsModel.findOneAndUpdate(
							{
								case: punishment.case,
							},
							{ $set: { date: new Date(), duration: duration } }
						);

						await (
							await interaction.guild.members.fetch(punishment.userId)
						).timeout(duration, 'Punishment duration updated.');
						await interaction.followUp({
							embeds: [
								client.embeds.success(
									`Duration was updated to **${convertTime(duration)}**.`
								),
							],
						});
					} else {
						return interaction.followUp({
							embeds: [
								client.embeds.error(
									'Only softbans and timeouts support durations.'
								),
							],
							ephemeral: true,
						});
					}
					break;
				case 2:
					if (punishment.reason === newvalue)
						return interaction.reply({
							embeds: [
								client.embeds.attention(
									'Try updating the reason to a value that is not the same as the current one.'
								),
							],
						});

					switch (id.length) {
						case PUNISHMENT_ID_LENGTH:
							punishment = await punishmentModel.findByIdAndUpdate(id, {
								$set: { reason: newvalue },
							});
							break;
						case AUTOMOD_ID_LENGTH:
							punishment = await automodModel.findByIdAndUpdate(id, {
								$set: { reason: newvalue },
							});
							break;
					}

					await interaction.followUp({
						embeds: [
							client.embeds.success(`Reason was updated to **${newvalue}**`),
						],
					});
					break;
			}

			const updateLog = await createModLog({
				action: punishment.type as PunishmentType,
				user: await client.users.fetch(punishment.userId),
				moderator: interaction.user,
				reason: value === 2 ? newvalue : punishment.reason,
				referencedPunishment: punishment,
				duration: value === 1 ? duration : null,
				update: value === 1 ? 'duration' : 'reason',
			});

			const firstLogId = (await getUrlFromCase(punishment.case)).split('/')[6];
			const getFirstLogChannel = (await client.channels
				.fetch((await getUrlFromCase(punishment.case)).split('/')[5])
				.catch(() => {})) as TextChannel;
			if (!getFirstLogChannel) return;
			const firstLog = (await getFirstLogChannel.messages
				.fetch(firstLogId)
				.catch(() => {})) as Message;
			if (!firstLog) return;

			switch (value) {
				case 1:
					client.config.webhooks.mod.editMessage(firstLogId, {
						embeds: [
							EmbedBuilder.from(firstLog.embeds[0]).setDescription(
								firstLog.embeds[0].description.replaceAll(
									'\n• **Duration',
									`\n• **Duration [[U](${updateLog})]`
								)
							),
						],
					});
					break;
				case 2:
					client.config.webhooks.mod.editMessage(firstLogId, {
						embeds: [
							EmbedBuilder.from(firstLog.embeds[0]).setDescription(
								firstLog.embeds[0].description.replaceAll(
									'\n• **Reason',
									`\n• **Reason [[U](${updateLog})]`
								)
							),
						],
					});
					break;
			}
		}
	},
});
