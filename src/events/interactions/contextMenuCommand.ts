import { Event } from '../../structures/Event';
import { client } from '../..';
import {
	CommandInteractionOptionResolver,
	GuildMember,
	Collection,
	ContextMenuCommandInteraction,
	EmbedBuilder,
} from 'discord.js';
const cooldown = new Collection();
import { connection, ConnectionStates } from 'mongoose';
import { logger } from '../../logger';
import { developers, ownerId } from '../../json/config.json';
import { convertTime } from '../../functions/convertTime';

export default new Event('interactionCreate', async (interaction) => {
	if (!interaction.inGuild()) return;
	if (!interaction.inCachedGuild()) return;

	if (interaction?.isContextMenuCommand()) {
		const member = interaction.member as GuildMember;
		const command = client.commands
			.filter((cmd) => cmd.interaction.directory !== 'developer')
			.get(interaction.commandName);

		if (!command)
			return interaction.reply({
				embeds: [
					client.embeds.error(
						`No context menus were found matching \`/${interaction.commandName}\``
					),
				],
				ephemeral: true,
			});

		// Permission Check
		if (
			command.interaction.permission?.some((perm) => !member.permissions.has(perm)) &&
			interaction.user.id !== ownerId
		)
			return interaction.reply({
				embeds: [
					client.embeds.attention(
						"You don't have permissions to run this command.interaction."
					),
				],
				ephemeral: true,
			});

		// Cooldowns
		if (cooldown.has(`${command.interaction.name}${interaction.user.id}`)) {
			const cooldownRemaining = `${~~(
				+cooldown.get(`${command.interaction.name}${interaction.user.id}`) - +Date.now()
			)}`;
			const cooldownEmbed = new EmbedBuilder()
				.setColor(client.cc.errorC)
				.setDescription(
					`You need to wait \`${convertTime(
						~~+cooldownRemaining
					)}\` to use this command again.`
				);

			return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
		}

		if (command.interaction.directory !== 'developer' && connection.readyState !== 1) {
			interaction.reply({
				embeds: [
					client.embeds.attention(
						'MongoDB is not connected properly, please contact a developer.'
					),
				],
				ephemeral: true,
			});
			return logger.warn({
				source: `${interaction.commandName} context menu`,
				reason: {
					name: 'MongoDB',
					message: 'Mongoose database is not connected properly',
					stack: `Current ready state: ${
						connection.readyState
					}\nCurrent ready status: ${ConnectionStates[connection.readyState]}`,
				},
			});
		}

		await command
			.excute({
				client: client,
				interaction: interaction as ContextMenuCommandInteraction,
				options: interaction.options as CommandInteractionOptionResolver,
			})
			.catch((err: Error) =>
				logger.error({
					source: `${interaction.commandName} context menu`,
					reason: err,
				})
			);

		if (
			command.interaction.cooldown &&
			!developers.includes(interaction.user.id) &&
			ownerId !== interaction.user.id
		) {
			cooldown.set(
				`${command.interaction.name}${interaction.user.id}`,
				Date.now() + command.interaction.cooldown
			);
			setTimeout(() => {
				cooldown.delete(`${command.interaction.name}${interaction.user.id}`);
			}, command.interaction.cooldown);
		}
	}
});
