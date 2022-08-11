import { EmbedBuilder, User } from 'discord.js';
import { t } from 'i18next';
import { capitalize } from '../../functions/other/capitalize';
import { interactions } from '../../interactions';
import { automodModel } from '../../models/automod';
import { punishmentModel } from '../../models/punishments';
import { Command } from '../../structures/Command';
import { Paginator } from '../../structures/Paginator';
import { PunishmentTypes } from '../../typings';
import { generateDiscordTimestamp } from '../../utils/generateDiscordTimestamp';

export default new Command({
	interaction: interactions.warnings,
	excute: async ({ client, interaction, options }) => {
		const user = interaction.user as User;
		const embed = new EmbedBuilder()
			.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
			.setColor(client.cc.invisible)
			.setThumbnail(user.displayAvatarURL());

		// Finding the warnings [option]
		const optionChoice = options.getNumber('type');
		var warningsMap: string[] = [];
		let warnCount = 0;

		if (!optionChoice) {
			const findWarningsNormal = await punishmentModel.find({
				userId: user.id,
			});
			const findWarningsAutomod = await automodModel.find({ userId: user.id });
			findWarningsNormal.forEach((data) => {
				warnCount = warnCount + 1;
				warningsMap.push(
					[
						t('command.mod.punishment.view.embed.manual-id', {
							warnCount,
							type: capitalize(data.type),
							id: data._id,
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
						.replaceAll('\nLINE_BREAK', '')
				);
			});
			findWarningsAutomod.forEach((data) => {
				warnCount = warnCount + 1;
				warningsMap.push(
					[
						t('command.mod.punishment.view.embed.automod-id', {
							warnCount,
							type: capitalize(data.type),
							id: data._id,
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
						.replaceAll('\nLINE_BREAK', '')
				);
			});
		} else if (optionChoice === 1) {
			const findWarningsNormal = await punishmentModel.find({
				userId: user.id,
			});

			warningsMap = findWarningsNormal.map((data) => {
				warnCount = warnCount + 1;
				return [
					t('command.mod.punishment.view.embed.manual-id', {
						warnCount,
						type: capitalize(data.type),
						id: data._id,
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
			});
		} else if (optionChoice === 2) {
			const findWarningsAutomod = await automodModel.find({ userId: user.id });

			warningsMap = findWarningsAutomod.map((data) => {
				warnCount = warnCount + 1;
				return [
					t('command.mod.punishment.view.embed.automod-id', {
						warnCount,
						type: capitalize(data.type),
						id: data._id,
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
			});
		}

		// Sending the results
		if (warningsMap.length === 0)
			return interaction.reply({
				embeds: [
					new EmbedBuilder({
						description: t('command.mod.warnings.no', {
							context: optionChoice ? (optionChoice === 1 ? 'manual' : 'automod') : null,
						}),
						color: client.cc.invisible,
					}),
				],
				ephemeral: true,
			});

		await interaction.deferReply();
		if (warningsMap.length <= 3) {
			embed.setDescription(warningsMap.map((data) => data.toString()).join('\n\n'));
			interaction.followUp({ embeds: [embed] });
		} else if (warningsMap.length > 3) {
			embed.setDescription('${{array}}').setFooter({
				text: t('command.mod.punishment.view.embed.footer', {
					currentPage: '${{currentPage}}',
					totalPages: '${{totalPages}}',
				}),
			});

			const paginator = new Paginator();
			paginator.start(interaction, {
				array: warningsMap.map((data) => data.toString()),
				itemPerPage: 3,
				joinWith: '\n\n',
				time: 60 * 1000,
				embed: embed,
			});
		}
	},
});
