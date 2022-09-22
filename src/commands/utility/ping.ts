import { EmbedBuilder } from 'discord.js';
import { t } from 'i18next';
import { connection } from 'mongoose';
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
			.setColor(client.cc.invisible)
			.setDescription(
				[
					t('command.utility.ping.mongoDB', {
						emoji: client.cc.ping.mongoDB,
						status: capitalize(t('command.utility.ping.status.' + connection.readyState.toString())),
					}),
					t('command.utility.ping.websocket', {
						emoji: client.cc.ping.ping,
						ping: client.ws.ping.toString(),
					}),
					t('command.utility.ping.roundtrip', {
						emoji: client.cc.ping.ping,
						ping: (Date.now() - interaction.createdTimestamp).toString(),
					}),
					'',
					t('command.utility.ping.uptime', {
						uptime: convertTime(+client.uptime),
					}),
				].join('\n')
			);

		interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	},
});
