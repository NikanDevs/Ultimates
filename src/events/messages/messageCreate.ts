import { Event } from '../../structures/Event';
import { client } from '../..';
import { Collection, GuildMember } from 'discord.js';
const cooldown = new Collection();

export default new Event('messageCreate', async (message) => {
	const member = message.member as GuildMember;
	if (
		message.author.bot ||
		!message.guild ||
		!message.content?.toLowerCase().startsWith(client.config.prefix)
	)
		return;

	const [cmd, ...args] = message.content.slice(client.config.prefix.length).trim().split(/ +/g);

	const filterCommands = client.commands.filter((cmd) => cmd.directory === 'developer');
	const command =
		filterCommands.get(cmd?.toLowerCase()) ||
		filterCommands.find((c) => c.aliases?.includes(cmd?.toLowerCase()));
	if (!command) return;

	// Developer Commands
	if (!client.config.developers.includes(message.author.id)) return;

	// Permission Check
	if (
		command.permission?.length &&
		!command.permission?.some((perm) => member.permissions.has(perm)) &&
		message.author.id !== client.config.owner
	)
		return;

	// Cooldowns
	if (cooldown.has(`${command.name}${message.author.id}`)) {
		const cooldownRemaining = `${~~(
			+cooldown.get(`${command.name}${message.author.id}`) - +Date.now()
		)}`;
		const cooldownEmbed = client.util
			.embed()
			.setColor(client.colors.error)
			.setDescription(
				`You need to wait \`${client.util.convertTime(
					~~(+cooldownRemaining / 1000)
				)} \` to use this command again.`
			);

		return message.reply({ embeds: [cooldownEmbed] }).then((msg) => {
			setTimeout(() => {
				message?.delete();
				msg?.delete();
			}, 5000);
		});
	}

	await command.excute({ client, message, args });
});
