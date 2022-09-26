import { EmbedBuilder, Message, TextChannel, User } from 'discord.js';
import { durationsModel } from '../../models/durations';
import { punishmentModel } from '../../models/punishments';
import { Command } from '../../structures/Command';
import { automodModel } from '../../models/automod';
import { logsModel } from '../../models/logs';
import { interactions } from '../../interactions';
import { PunishmentTypes } from '../../typings';
import { createModLog } from '../../functions/logs/createModLog';
import { generateDiscordTimestamp } from '../../utils/generateDiscordTimestamp';
import { AUTOMOD_ID_LENGTH, PUNISHMENT_ID_LENGTH } from '../../constants';
import { getUrlFromCase } from '../../functions/cases/getURL';
import { capitalize } from '../../functions/other/capitalize';
import { t } from 'i18next';
import { Paginator } from '../../structures/Paginator';
import { getModCase } from '../../functions/cases/modCase';

export default new Command({
	interaction: interactions.punishment,
	excute: async ({ client, interaction, options }) => {
		const subcommand = options.getSubcommand();

		if (subcommand === 'revoke') {
			const id = options.getString('id');
			const reason = options.getString('reason') ?? t('common.noReason');

			const punishment =
				id.length == AUTOMOD_ID_LENGTH
					? await automodModel.findById(id).catch(() => {})
					: await punishmentModel.findById(id).catch(() => {});
			if (!punishment)
				return interaction.reply({
					embeds: [client.embeds.error(t('common.$errors.invalidID'))],
					ephemeral: true,
				});

			await interaction.deferReply({ ephemeral: true });
			const getMember = interaction.guild.members.cache.get(punishment.userId);
			const fetchUser = await client.users.fetch(punishment.userId);
			switch (punishment.type) {
				case PunishmentTypes.Timeout:
					if (
						await durationsModel.findOne({
							type: PunishmentTypes.Timeout,
							userId: punishment.userId,
						})
					) {
						if (!getMember)
							return interaction.followUp({
								embeds: [
									client.embeds.error(
										t('command.mod.punishment.revoke.timeout', { context: 'invalid' })
									),
								],
							});

						await getMember.timeout(null, reason);

						await interaction.followUp({
							embeds: [client.embeds.success(t('command.mod.punishment.revoke.revoked', { id }))],
						});

						await createModLog({
							action: PunishmentTypes.Unmute,
							user: fetchUser,
							moderator: interaction.user,
							reason: reason,
							referencedPunishment: punishment,
						}).then(async (updateLog) => {
							await durationsModel.findOneAndDelete({
								type: PunishmentTypes.Timeout,
								case: punishment.case,
							});
							await punishment.delete();
							await updateRevokeCases(punishment, updateLog);
						});
					} else {
						await interaction.followUp({
							embeds: [client.embeds.success(t('command.mod.punishment.revoke.revoked', { id }))],
						});

						await createModLog({
							action: punishment.type as PunishmentTypes,
							user: fetchUser,
							moderator: interaction.user,
							reason: reason,
							referencedPunishment: punishment,
							revoke: true,
						}).then(async (updateLog) => {
							await punishment.delete();
							await updateRevokeCases(punishment, updateLog);
						});
					}
					break;
				case PunishmentTypes.Ban:
				case PunishmentTypes.Softban:
					if (await interaction.guild.bans.fetch(punishment.userId).catch(() => {})) {
						interaction.guild.members.unban(fetchUser, reason);

						if (punishment.type === PunishmentTypes.Softban)
							await durationsModel.findOneAndDelete({
								type: PunishmentTypes.Softban,
								case: punishment.case,
							});

						await interaction.followUp({
							embeds: [client.embeds.success(t('command.mod.punishment.revoke.revoked', { id }))],
						});

						await createModLog({
							action: PunishmentTypes.Unban,
							user: fetchUser,
							moderator: interaction.user,
							reason: reason,
							referencedPunishment: punishment,
						}).then(async (updateLog) => {
							await punishment.delete();
							await updateRevokeCases(punishment, updateLog);
						});
					} else {
						await interaction.followUp({
							embeds: [client.embeds.success(t('command.mod.punishment.revoke.revoked', { id }))],
						});

						await createModLog({
							action: punishment.type as PunishmentTypes,
							user: fetchUser,
							moderator: interaction.user,
							reason: reason,
							referencedPunishment: punishment,
							revoke: true,
						}).then(async (updateLog) => {
							await punishment.delete();
							await updateRevokeCases(punishment, updateLog);
						});
					}
					break;
				default:
					await interaction.followUp({
						embeds: [client.embeds.success(t('command.mod.punishment.revoke.revoked', { id }))],
					});

					await createModLog({
						action: punishment.type as PunishmentTypes,
						user: fetchUser,
						moderator: interaction.user,
						reason: reason,
						referencedPunishment: punishment,
						revoke: true,
					}).then(async (updateLog) => {
						await punishment.delete();
						await updateRevokeCases(punishment, updateLog);
					});
					break;
			}

			// Functions
			async function updateRevokeCases(punishment: any, updateLog: any) {
				if ((await logsModel.findById(punishment.case))?.antiraid) return;
				const substanceLogID = (await getUrlFromCase(punishment.case)).split('/')[6];
				const substanceLogChannel = (await client.channels
					.fetch((await getUrlFromCase(punishment.case)).split('/')[5])
					.catch(() => {})) as TextChannel;
				if (!substanceLogChannel) return;
				const logMessage = (await substanceLogChannel.messages
					.fetch(substanceLogID)
					.catch(() => {})) as Message;
				if (!logMessage) return;

				await client.config.logging.webhook
					.editMessage(substanceLogID, {
						threadId: client.config.logging.mod.channelId,
						embeds: [
							!logMessage.embeds[0].description.endsWith(':R>*')
								? EmbedBuilder.from(logMessage.embeds[0]).setDescription(
										[
											logMessage.embeds[0].description,
											'',
											t('command.mod.punishment.revoke.history', {
												case: (await getModCase()) - 1,
												url: updateLog,
											}),
										].join('\n')
								  )
								: EmbedBuilder.from(logMessage.embeds[0]).setDescription(
										[
											logMessage.embeds[0].description,
											t('command.mod.punishment.revoke.history', {
												case: (await getModCase()) - 1,
												url: updateLog,
											}),
										].join('\n')
								  ),
						],
					})
					.then(async () => {
						await logsModel.findByIdAndDelete(punishment.case);
					});
			}
		} else if (subcommand === 'search') {
			let doesExist: boolean = true;
			const id = options.getString('id');
			const baseEmbed = new EmbedBuilder().setColor(client.cc.invisible);

			switch (id.length) {
				case AUTOMOD_ID_LENGTH:
					const automodWarn = await automodModel.findById(id).catch(() => {});
					if (!automodWarn) return (doesExist = false);
					const automodUser = (await client.users.fetch(automodWarn.userId).catch(() => {})) as User;

					baseEmbed
						.setDescription(
							t('command.mod.punishment.search.description', {
								id,
								case: automodWarn.case,
								url: await getUrlFromCase(automodWarn.case),
							})
						)
						.setAuthor({
							name: client.user.username,
							iconURL: client.user.displayAvatarURL(),
						})
						.addFields([
							{
								name: t('command.mod.punishment.search.type', { context: 'name' }),
								value: t('command.mod.punishment.search.type', {
									context: 'automod',
									type: capitalize(automodWarn.type),
								}),
								inline: true,
							},
							{
								name: t('command.mod.punishment.search.date', { context: 'name' }),
								value: generateDiscordTimestamp(automodWarn.date, 'Short Date/Time'),
								inline: true,
							},
							{
								name: t('command.mod.punishment.search.expire', { context: 'name' }),
								value: generateDiscordTimestamp(automodWarn.expire),
								inline: true,
							},
							{
								name: t('command.mod.punishment.search.user', { context: 'name' }),
								value: automodUser.toString(),
								inline: true,
							},
							{
								name: t('command.mod.punishment.search.user', { context: 'tag' }),
								value: automodUser.tag,
								inline: true,
							},
							{
								name: t('command.mod.punishment.search.user', { context: 'id' }),
								value: automodWarn.userId,
								inline: true,
							},
							{
								name: t('command.mod.punishment.search.reason', { context: 'name' }),
								value: automodWarn.reason,
								inline: true,
							},
						]);
					break;
				case PUNISHMENT_ID_LENGTH:
					const manualWarn = await punishmentModel.findById(id).catch(() => {
						doesExist = false;
					});
					if (!manualWarn) return (doesExist = false);

					const manualUser = (await client.users.fetch(manualWarn.userId).catch(() => {})) as User;
					const getMod = (await client.users.fetch(manualWarn.moderatorId).catch(() => {})) as User;

					baseEmbed
						.setDescription(
							t('command.mod.punishment.search.description', {
								id,
								case: manualWarn.case,
								url: await getUrlFromCase(manualWarn.case),
							})
						)
						.setAuthor({
							name: client.user.username,
							iconURL: client.user.displayAvatarURL(),
						})
						.addFields([
							{
								name: t('command.mod.punishment.search.type', { context: 'name' }),
								value: t('command.mod.punishment.search.type', {
									context: 'manual',
									type: capitalize(manualWarn.type),
								}),
								inline: true,
							},
							{
								name: t('command.mod.punishment.search.date', { context: 'name' }),
								value: generateDiscordTimestamp(manualWarn.date, 'Short Date/Time'),
								inline: true,
							},
							{
								name: t('command.mod.punishment.search.expire', { context: 'name' }),
								value: generateDiscordTimestamp(manualWarn.expire),
								inline: true,
							},
							{
								name: t('command.mod.punishment.search.user', { context: 'name' }),
								value: manualUser.toString(),
								inline: true,
							},
							{
								name: t('command.mod.punishment.search.user', { context: 'tag' }),
								value: manualUser.tag,
								inline: true,
							},
							{
								name: t('command.mod.punishment.search.user', { context: 'id' }),
								value: manualWarn.userId,
								inline: true,
							},
							{
								name: t('command.mod.punishment.search.mod', { context: 'name' }),
								value: getMod.toString(),
								inline: true,
							},
							{
								name: t('command.mod.punishment.search.mod', { context: 'tag' }),
								value: getMod.tag,
								inline: true,
							},
							{
								name: t('command.mod.punishment.search.mod', { context: 'id' }),
								value: manualWarn.moderatorId,
								inline: true,
							},
							{
								name: t('command.mod.punishment.search.reason', { context: 'name' }),
								value: manualWarn.reason,
								inline: true,
							},
						]);
					break;
				default:
					doesExist = false;
					break;
			}

			if (!doesExist)
				return interaction.reply({
					embeds: [client.embeds.error(t('common.$errors.invalidID'))],
					ephemeral: true,
				});

			interaction.reply({ embeds: [baseEmbed] });
		} else if (subcommand === 'view') {
			const user = options.getUser('user');

			const findWarningsNormal = await punishmentModel.find({ userId: user.id });
			const findWarningsAutomod = await automodModel.find({ userId: user.id });
			let warnCount = 0;

			const warnings = findWarningsNormal
				.map((data) => {
					warnCount = warnCount + 1;
					return [
						t('command.mod.punishment.view.embed.manual-id', {
							warnCount: warnCount.toString(),
							type: capitalize(data.type),
							id: data._id,
						}),
						t('command.mod.punishment.view.embed.date', {
							date: generateDiscordTimestamp(data.date, 'Short Date/Time'),
						}),
						t('command.mod.punishment.view.embed.moderator', {
							moderator:
								data.moderatorId === client.user.id
									? t('command.mod.punishment.view.automatic')
									: client.users.cache.get(data.moderatorId)?.tag || data.moderatorId,
						}),
						data.type === PunishmentTypes.Warn
							? t('command.mod.punishment.view.embed.expire', {
									expire: generateDiscordTimestamp(data.expire),
							  })
							: 'LINE_BREAK',
						t('command.mod.punishment.view.embed.reason', { reason: data.reason }),
					]
						.join('\n')
						.replaceAll('\nLINE_BREAK', '');
				})
				.concat(
					findWarningsAutomod.map((data) => {
						warnCount = warnCount + 1;
						return [
							t('command.mod.punishment.view.embed.automod-id', {
								warnCount: warnCount.toString(),
								type: capitalize(data.type),
							}),
							t('command.mod.punishment.view.embed.date', {
								date: generateDiscordTimestamp(data.date, 'Short Date/Time'),
							}),
							data.type === PunishmentTypes.Warn
								? t('command.mod.punishment.view.embed.expire', {
										expire: generateDiscordTimestamp(data.expire),
								  })
								: 'LINE_BREAK',
							t('command.mod.punishment.view.embed.reason', { reason: data.reason }),
						]
							.join('\n')
							.replaceAll('\nLINE_BREAK', '');
					})
				);

			const embed = new EmbedBuilder()
				.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
				.setColor(client.cc.invisible)
				.setThumbnail(user.displayAvatarURL());

			if (warnings.length === 0)
				return interaction.reply({
					embeds: [
						new EmbedBuilder({
							description: t('command.mod.punishment.view.noPunishments', { user: user.tag }),
							color: client.cc.invisible,
						}),
					],
					ephemeral: true,
				});

			await interaction.deferReply();
			if (warnings.length <= 3) {
				embed.setDescription(warnings.map((data) => data.toString()).join('\n\n'));
				interaction.followUp({ embeds: [embed] });
			} else if (warnings.length > 3) {
				embed.setDescription('${{array}}').setFooter({
					text: t('command.mod.punishment.view.embed.footer', {
						currentPage: '${{currentPage}}',
						totalPages: '${{totalPages}}',
					}),
				});

				const paginator = new Paginator();
				paginator.start(interaction, {
					array: warnings.map((data) => data.toString()),
					itemPerPage: 3,
					joinWith: '\n\n',
					time: 60 * 1000,
					embed: embed,
				});
			}
		} else if (subcommand === 'reason') {
			const id = options.getString('id');
			let reason = options.getString('reason');
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
					embeds: [client.embeds.error(t('common.$errors.invalidID'))],
					ephemeral: true,
				});

			if (punishment.reason === reason)
				return interaction.followUp({
					embeds: [client.embeds.attention(t('command.mod.punishment.reason.invalidReason'))],
				});

			switch (id.length) {
				case PUNISHMENT_ID_LENGTH:
					punishment = await punishmentModel.findByIdAndUpdate(id, {
						$set: { reason: reason },
					});
					break;
				case AUTOMOD_ID_LENGTH:
					punishment = await automodModel.findByIdAndUpdate(id, {
						$set: { reason: reason },
					});
					break;
			}

			await interaction.followUp({
				embeds: [client.embeds.success(t('command.mod.punishment.reason.updated', { reason }))],
			});

			const updateLog = await createModLog({
				action: punishment.type as PunishmentTypes,
				user: await client.users.fetch(punishment.userId),
				moderator: interaction.user,
				reason: reason,
				referencedPunishment: punishment,
				update: true,
			});

			if ((await logsModel.findById(punishment.case)).antiraid) return;
			const substanceLogID = (await getUrlFromCase(punishment.case)).split('/')[6];
			const substanceLogChannel = (await client.channels
				.fetch((await getUrlFromCase(punishment.case)).split('/')[5])
				.catch(() => {})) as TextChannel;
			if (!substanceLogChannel) return;
			const logMessage = (await substanceLogChannel.messages.fetch(substanceLogID).catch(() => {})) as Message;
			if (!logMessage) return;

			client.config.logging.webhook.editMessage(substanceLogID, {
				threadId: client.config.logging.mod.channelId,
				embeds: [
					!logMessage.embeds[0].description.endsWith(':R>*')
						? EmbedBuilder.from(logMessage.embeds[0]).setDescription(
								[
									logMessage.embeds[0].description,
									'',
									t('command.mod.punishment.reason.history', {
										case: (await getModCase()) - 1,
										date: generateDiscordTimestamp(new Date()),
										url: updateLog,
									}),
								].join('\n')
						  )
						: EmbedBuilder.from(logMessage.embeds[0]).setDescription(
								[
									logMessage.embeds[0].description,
									t('command.mod.punishment.reason.history', {
										case: (await getModCase()) - 1,
										date: generateDiscordTimestamp(new Date()),
										url: updateLog,
									}),
								].join('\n')
						  ),
				],
			});
		}
	},
});
