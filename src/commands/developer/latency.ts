import { TextChannel } from 'discord.js';
import { Command } from '../../structures/Command';

export default new Command({
	name: 'latency',
	description: 'Shows the latency and the uptime.',
	directory: 'developer',
	aliases: ['ping', 'uptime'],

	excute: async ({ client, message }) => {
		const pingEmoji = client.emojis.cache.get('894097855759912970');
		const pingEmbed = client.util
			.embed()
			.setAuthor({
				name: client.user.username,
				iconURL: client.user.displayAvatarURL(),
			})
			.setColor(client.colors.ultimates)
			.addFields(
				{
					name: `${pingEmoji} Message`,
					value: `• \`${Date.now() - message.createdTimestamp}ms\``,
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

		(message.channel as TextChannel).send({ embeds: [pingEmbed] });
	},
});
