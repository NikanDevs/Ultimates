import { Event } from '../../structures/Event';
import { client } from '../..';
import {
	CommandInteractionOptionResolver,
	GuildMember,
	Collection,
	ContextMenuCommandInteraction,
} from 'discord.js';
import { reportError } from '../../functions/reportError';
const cooldown = new Collection();

export default new Event('interactionCreate', async (interaction) => {
	if (!interaction.inGuild()) return;
	if (!interaction.inCachedGuild()) return;

	if (interaction?.isContextMenuCommand()) {
		const member = interaction.member as GuildMember;
		const command = client.commands
			.filter((cmd) => cmd.directory !== 'developer')
			.get(interaction.commandName);

		if (!command)
			return interaction.reply({
				embeds: [
					client.embeds.error(
						`No commands were found matching \`/${interaction.commandName}\``
					),
				],
				ephemeral: true,
			});

		// Permission Check
		if (
			command.permission?.some((perm) => !member.permissions.has(perm)) &&
			interaction.user.id !== client.config.owner
		)
			return interaction.reply({
				embeds: [
					client.embeds.attention("You don't have permissions to run this command."),
				],
				ephemeral: true,
			});

		// Cooldowns
		if (cooldown.has(`${command.name}${interaction.user.id}`)) {
			const cooldownRemaining = `${~~(
				+cooldown.get(`${command.name}${interaction.user.id}`) - +Date.now()
			)}`;
			const cooldownEmbed = client.util
				.embed()
				.setColor(client.colors.error)
				.setDescription(
					`You need to wait \`${client.util.convertTime(
						~~(+cooldownRemaining / 1000)
					)}\` to use this command again.`
				);

			return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
		}

		await command
			.excute({
				client: client,
				interaction: interaction as ContextMenuCommandInteraction,
				options: interaction.options as CommandInteractionOptionResolver,
			})
			.catch((err: Error) => reportError(interaction, interaction.commandName, err));

		if (
			command.cooldown &&
			!client.config.developers.includes(interaction.user.id) &&
			client.config.owner !== interaction.user.id
		) {
			cooldown.set(`${command.name}${interaction.user.id}`, Date.now() + command.cooldown);
			setTimeout(() => {
				cooldown.delete(`${command.name}${interaction.user.id}`);
			}, command.cooldown);
		}
	}
});
