import { ComponentType, EmbedBuilder, Message } from 'discord.js';
import { buildPaginationButtons } from '../../functions/client/functions';
import { interactions } from '../../interactions';
import { automodModel } from '../../models/automod';
import { punishmentModel } from '../../models/punishments';
import { Command } from '../../structures/Command';
import { PunishmentType } from '../../typings/PunishmentType';
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
					`\`${warnCounter}\` **${client.util.capitalize(data.type)}** | **ID: ${
						data._id
					}**`,
					`• **Date:** ${generateDiscordTimestamp(data.date, 'Short Date/Time')}`,
					data.moderatorId === client.user.id
						? `• **Moderator:** Automatic`
						: client.users.cache.get(data.moderatorId) === undefined
						? `• **Moderator ID:** ${data.moderatorId}`
						: `• **Moderator:** ${client.users.cache.get(data.moderatorId).tag}`,
					data.type === PunishmentType.Warn
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
						data.type === PunishmentType.Warn
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
			warningsEmbed.setDescription(warnings.map((data) => data.toString()).join('\n\n'));
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
				components: [buildPaginationButtons()],
			})) as Message;

			const collector = sentInteraction.createMessageComponentCollector({
				time: 60000,
				componentType: ComponentType.Button,
			});

			collector.on('collect', (collected): any => {
				if (interaction.user.id !== collected.user.id)
					return collected.reply({
						content: 'You can not use this.',
						ephemeral: true,
					});

				switch (collected.customId) {
					case '1':
						if (currentPage === 1) collected.deferUpdate();

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
						if (currentPage === totalPages) collected.deferUpdate();

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
	},
});
