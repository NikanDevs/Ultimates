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
	interaction: interactions.Punishments,
	excute: async ({ client, interaction }) => {
		if (!interaction.isUserContextMenuCommand()) return;
		const user = interaction.targetUser as User;

		// Getting all the warnings
		const findWarningsNormal = await punishmentModel.find({ userId: user.id });
		const findWarningsAutomod = await automodModel.find({ userId: user.id });
		let warnCount = 0;

		const warnings = findWarningsNormal
			.map((data) => {
				warnCount = warnCount + 1;
				return [
					t('command.context.punishments.embed.manual-id', {
						warnCount: warnCount.toString(),
						type: capitalize(data.type),
						id: data._id,
					}),
					t('command.context.punishments.embed.date', {
						date: generateDiscordTimestamp(data.date, 'Short Date/Time'),
					}),
					t('command.context.punishments.embed.moderator', {
						moderator:
							data.moderatorId === client.user.id
								? t('command.context.punishments.automatic')
								: client.users.cache.get(data.moderatorId)?.tag || data.moderatorId,
					}),
					data.type === PunishmentTypes.Warn
						? t('command.context.punishments.embed.expire', {
								expire: generateDiscordTimestamp(data.expire),
						  })
						: 'LINE_BREAK',
					t('command.context.punishments.embed.reason', { reason: data.reason }),
				]
					.join('\n')
					.replaceAll('\nLINE_BREAK', '');
			})
			.concat(
				findWarningsAutomod.map((data) => {
					warnCount = warnCount + 1;
					return [
						t('command.context.punishments.embed.automod-id', {
							warnCount: warnCount.toString(),
							type: capitalize(data.type),
						}),
						t('command.context.punishments.embed.date', {
							date: generateDiscordTimestamp(data.date, 'Short Date/Time'),
						}),
						data.type === PunishmentTypes.Warn
							? t('command.context.punishments.embed.expire', {
									expire: generateDiscordTimestamp(data.expire),
							  })
							: 'LINE_BREAK',
						t('command.context.punishments.embed.reason', { reason: data.reason }),
					]
						.join('\n')
						.replaceAll('\nLINE_BREAK', '');
				})
			);

		const embed = new EmbedBuilder()
			.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
			.setColor(client.cc.invisible)
			.setThumbnail(user.displayAvatarURL());

		// Sending the results
		if (warnings.length === 0)
			return interaction.reply({
				embeds: [
					new EmbedBuilder({
						description: t('command.context.punishments.noPunishments', { user: user.tag }),
						color: client.cc.invisible,
					}),
				],
				ephemeral: true,
			});

		await interaction.deferReply({ ephemeral: true });
		if (warnings.length <= 3) {
			embed.setDescription(warnings.map((data) => data.toString()).join('\n\n'));
			interaction.followUp({ embeds: [embed] });
		} else if (warnings.length > 3) {
			embed.setDescription('${{array}}').setFooter({
				text: t('command.context.punishments.embed.footer', {
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
	},
});
