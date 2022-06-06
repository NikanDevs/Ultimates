import { EmbedBuilder } from 'discord.js';
import { ConnectionStates, connection } from 'mongoose';
import { interactions } from '../../interactions';
import { Command } from '../../structures/Command';

export default new Command({
	interaction: interactions.ping,
	excute: async ({ client, interaction }) => {
		const embed = new EmbedBuilder()
			.setAuthor({
				name: client.user.username,
				iconURL: client.user.displayAvatarURL(),
			})
			.setColor(client.cc.ultimates)
			.setDescription(
				[
					`${pingEmoji(client.ws.ping)} **Websocket** - ${client.ws.ping}ms`,
					`${pingEmoji(Date.now() - interaction.createdTimestamp)} **Roundtrip** - ${
						Date.now() - interaction.createdTimestamp
					}ms`,
					`<:mongoDB:983328317929316392> **MongoDB** - ${client.util.capitalize(
						ConnectionStates[connection.readyState]
					)}`,
				].join('\n')
			);

		interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});

		function pingEmoji(value: number) {
			if (value > 300) {
				return '<:pingB:983330298924269589>';
			} else if (value > 150) {
				return '<:pingM:983330301692510248>';
			} else {
				return '<:pingE:983330296831283230> ';
			}
		}
	},
});
