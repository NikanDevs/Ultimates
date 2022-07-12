import { EmbedBuilder } from 'discord.js';
import { ConnectionStates, connection } from 'mongoose';
import { convertTime } from '../../functions/convertTime';
import { capitalize } from '../../functions/other/capitalize';
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
					`${client.cc.ping.mongoDB} **MongoDB** - ${capitalize(
						ConnectionStates[connection.readyState]
					)}`,
					`${client.cc.ping.ping} **Websocket** - ${client.ws.ping}ms`,
					`${client.cc.ping.ping} **Roundtrip** - ${
						Date.now() - interaction.createdTimestamp
					}ms`,
					'',
					`🕓 **Uptime** - ${convertTime(+client.uptime)}`,
				].join('\n')
			);

		interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	},
});
