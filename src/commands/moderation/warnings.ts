import { EmbedBuilder, User } from 'discord.js';
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
		if (!optionChoice) {
			const findWarningsNormal = await punishmentModel.find({
				userId: user.id,
			});
			const findWarningsAutomod = await automodModel.find({ userId: user.id });
			let warnCounter = 0;

			findWarningsNormal.forEach((data) => {
				warnCounter = warnCounter + 1;
				warningsMap.push(
					[
						`\`${warnCounter}\` **${capitalize(data.type)}** | **ID: ${data._id}**`,
						`• **Date:** ${generateDiscordTimestamp(data.date, 'Short Date/Time')}`,
						data.type === PunishmentTypes.Warn
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
				warningsMap.push(
					[
						`\`${warnCounter}\` **${capitalize(data.type)}** | Auto Moderation`,
						`• **Date:** ${generateDiscordTimestamp(data.date, 'Short Date/Time')}`,
						data.type === PunishmentTypes.Warn
							? `• **Expire:** ${generateDiscordTimestamp(data.expire)}`
							: 'LINE_BREAK',
						`• **Reason:** ${data.reason}`,
					]
						.join('\n')
						.replaceAll('\nLINE_BREAK', '')
				);
			});
		} else if (optionChoice === 1) {
			const findWarningsNormal = await punishmentModel.find({
				userId: user.id,
			});
			let warnCounter = 0;
			warningsMap = findWarningsNormal.map((data) => {
				warnCounter = warnCounter + 1;
				return [
					`\`${warnCounter}\` **${capitalize(data.type)}** | **ID: ${data._id}**`,
					`• **Date:** ${generateDiscordTimestamp(data.date, 'Short Date/Time')}`,
					data.type === PunishmentTypes.Warn
						? `• **Expire:** ${generateDiscordTimestamp(data.expire)}`
						: 'LINE_BREAK',
					`• **Reason:** ${data.reason}`,
				]
					.join('\n')
					.replaceAll('\nLINE_BREAK', '');
			});
		} else if (optionChoice === 2) {
			const findWarningsAutomod = await automodModel.find({ userId: user.id });
			let warnCounter = 0;

			warningsMap = findWarningsAutomod.map((data) => {
				warnCounter = warnCounter + 1;
				return [
					`\`${warnCounter}\` **${capitalize(data.type)}** | Auto Moderation`,
					`• **Date:** ${generateDiscordTimestamp(data.date, 'Short Date/Time')}`,
					data.type === PunishmentTypes.Warn
						? `• **Expire:** ${generateDiscordTimestamp(data.date)}`
						: 'LINE_BREAK',
					`• **Reason:** ${data.reason}`,
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
						description: `No ${
							optionChoice ? (optionChoice === 1 ? 'manual ' : 'automod ') : ''
						}warnings were found for you, you're clean!`,
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
				text: 'Page ${{currentPage}}/${{totalPages}}',
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
