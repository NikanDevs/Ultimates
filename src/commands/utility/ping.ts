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
			.setColor(client.cc.ultimates)
			.setDescription(
				[
					`${client.cc.ping.mongoDB} **${t('command.utility.ping.mongoDB')}** - ${capitalize(
						t('command.utility.ping.status.' + connection.readyState.toString())
					)}`,
					`${client.cc.ping.ping} **${t('command.utility.ping.websocket')}** - ${client.ws.ping}ms`,
					`${client.cc.ping.ping} **${t('command.utility.ping.roundtrip')}** - ${
						Date.now() - interaction.createdTimestamp
					}ms`,
					'',
					`🕓 **${t('command.utility.ping.uptime')}** - ${convertTime(+client.uptime)}`,
				].join('\n')
			);

		interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	},
});
