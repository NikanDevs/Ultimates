import { ComponentType, ContextMenuCommandInteraction, Message } from 'discord.js';
import { automodModel } from '../../models/automod';
import { punishmentModel } from '../../models/punishments';
import { Command } from '../../structures/Command';
import { PunishmentType } from '../../typings/PunishmentType';
import { generateDiscordTimestamp } from '../../utils/generateDiscordTimestamp';

export default new Command({
	name: 'Punishments',
	description: 'Shows the punishments for a user.',
	directory: 'moderation',
	cooldown: 5000,
	permission: ['ManageMessages'],
	type: 2,

	excute: async ({ client, interaction }) => {
		const Interaction = interaction as ContextMenuCommandInteraction;
		const user = (await interaction.guild.members.fetch(Interaction.targetId)).user;

		// Getting all the warnings
		var warningsArray: string[] = [];
		const findWarningsNormal = await punishmentModel.find({ userId: user.id });
		const findWarningsAutomod = await automodModel.find({ userId: user.id });
		let warnCounter = 0;

		findWarningsNormal.forEach((data) => {
			warnCounter = warnCounter + 1;
			warningsArray.push(
				[
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
					`• **Date:** ${generateDiscordTimestamp(data.date, 'Short Date/Time')}`,
					data.type === PunishmentType.Warn
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
			return Interaction.reply({
				embeds: [
					client.util.embed({
						description: `No punishments were found for **${user.tag}**`,
						color: client.colors.invisible,
					}),
				],
				ephemeral: true,
			});
		await Interaction.deferReply();
		if (warningsArray.length <= 3) {
			warningsEmbed.setDescription(
				warningsArray.map((data) => data.toString()).join('\n\n')
			);
			Interaction.followUp({ embeds: [warningsEmbed] });
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
			var sentInteraction = (await Interaction.followUp({
				embeds: [warningsEmbed],
				components: [client.util.build.paginator()],
			})) as Message;

			const collector = sentInteraction.createMessageComponentCollector({
				time: 60000,
				componentType: ComponentType['Button'],
			});

			collector.on('collect', (collected) => {
				if (Interaction.user.id !== collected.user.id)
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

						Interaction.editReply({ embeds: [warningsEmbed] });
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

						Interaction.editReply({ embeds: [warningsEmbed] });
						collected.deferUpdate();
						break;
				}
			});

			collector.on('end', () => {
				Interaction.editReply({ components: [] });
			});
		}
	},
});
