import { EmbedBuilder } from 'discord.js';
import { convertTime } from '../../functions/convertTime';
import { interactions } from '../../interactions';
import { Command } from '../../structures/Command';

export default new Command({
	interaction: interactions.ping,
	excute: async ({ client, interaction }) => {
		const pingEmoji = client.emojis.cache.get('894097855759912970');
		const embed = new EmbedBuilder()
			.setAuthor({
				name: client.user.username,
				iconURL: client.user.displayAvatarURL(),
			})
			.setColor(client.cc.ultimates)
			.addFields([
				{
					name: `${pingEmoji} Interaction`,
					value: `• \`${Date.now() - interaction.createdTimestamp}ms\``,
					inline: true,
				},
				{
					name: `${pingEmoji} Client`,
					value: `• \`${client.ws.ping}ms\``,
					inline: true,
				},
				{
					name: '🕐 Uptime',
					value: convertTime(~~client.uptime),
				},
			]);
		interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	},
});
