import {
	// ActionRowBuilder,
	// ButtonBuilder,
	// ButtonStyle,
	// ComponentType,
	EmbedBuilder,
} from 'discord.js';
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
		const user = interaction.targetUser;

		// Getting all the warnings
		const findWarningsNormal = await punishmentModel.find({ userId: user.id });
		const findWarningsAutomod = await automodModel.find({ userId: user.id });
		let warnCounter = 0;

		const warnings = findWarningsNormal
			.map((data) => {
				warnCounter = warnCounter + 1;
				return [
					`\`${warnCounter}\` **${capitalize(data.type)}** | **ID: ${data._id}**`,
					`• **Date:** ${generateDiscordTimestamp(data.date, 'Short Date/Time')}`,
					data.moderatorId === client.user.id
						? `• **Moderator:** Automatic`
						: client.users.cache.get(data.moderatorId) === undefined
						? `• **Moderator ID:** ${data.moderatorId}`
						: `• **Moderator:** ${client.users.cache.get(data.moderatorId).tag}`,
					data.type === PunishmentTypes.Warn
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
						`\`${warnCounter}\` **${capitalize(data.type)}** | Auto Moderation`,
						`• **Date:** ${generateDiscordTimestamp(
							data.date,
							'Short Date/Time'
						)}`,
						data.type === PunishmentTypes.Warn
							? `• **Expire:** ${generateDiscordTimestamp(data.expire)}`
							: 'LINE_BREAK',
						`• **Reason:** ${data.reason}`,
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
						description: `No punishments were found for **${user.tag}**`,
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
				text: 'Page ${{currentPage}}/${{totalPages}}',
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
