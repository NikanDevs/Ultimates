import { pingCommand } from '../../interactions/utility/ping';
import { Command } from '../../structures/Command';

export default new Command({
	interaction: pingCommand,
	excute: async ({ client, interaction }) => {
		const pingEmoji = client.emojis.cache.get('894097855759912970');
		const embed = client.util
			.embed()
			.setAuthor({
				name: client.user.username,
				iconURL: client.user.displayAvatarURL(),
			})
			.setColor(client.cc.ultimates)
			.addFields(
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
					value: client.util.convertTime(~~(client.uptime / 1000), {
						joinWith: '•',
						surrounded: '**',
					}),
				}
			);
		interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	},
});
