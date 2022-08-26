import { Event } from '../../structures/Event';
import { client } from '../..';
import {
	CommandInteractionOptionResolver,
	GuildMember,
	Collection,
	ContextMenuCommandInteraction,
	EmbedBuilder,
	Colors,
} from 'discord.js';
const cooldown = new Collection();
import { connection, ConnectionStates } from 'mongoose';
import { logger } from '../../logger';
import { convertTime } from '../../functions/convertTime';
import { t } from 'i18next';

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
						t('event.interactions.applicationCommand.noCommand', { cmd: interaction.commandName })
					),
				],
				ephemeral: true,
			});

		// Permission Check
		if (command.interaction.permission?.some((perm) => !member.permissions.has(perm)))
			return interaction.reply({
				embeds: [client.embeds.attention(t('common.errors.noPerms'))],
				ephemeral: true,
			});

		// Bot Permission Check
		if (!interaction.guild.members.me.permissions.has(command.interaction.botPermission ?? []))
			return interaction.reply({
				embeds: [
					client.embeds.attention(
						t('event.interactions.applicationCommand', {
							permissions: command.interaction.botPermission.map((p) => p.toString()).join(', '),
							count: command.interaction.botPermission.length,
						})
					),
				],
				ephemeral: true,
			});

		// Cooldowns
		if (cooldown.has(`${command.interaction.name}${interaction.user.id}`)) {
			const cooldownRemaining = `${~~(
				+cooldown.get(`${command.interaction.name}${interaction.user.id}`) - +Date.now()
			)}`;
			const cooldownEmbed = new EmbedBuilder().setColor(Colors.Red).setDescription(
				t('event.interactions.applicationCommand.cooldown', {
					time: convertTime(~~+cooldownRemaining),
				})
			);

			return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
		}

		if (command.interaction.directory !== 'developer' && connection.readyState !== 1) {
			interaction.reply({
				embeds: [client.embeds.attention(t('event.interactions.applicationCommand.mongoDB'))],
				ephemeral: true,
			});
			return logger.warn({
				source: `${interaction.commandName}`,
				reason: {
					name: 'MongoDB',
					message: 'Mongoose database is not connected properly',
					stack: `Current ready state: ${connection.readyState}\nCurrent ready status: ${
						ConnectionStates[connection.readyState]
					}`,
				},
			});
		}

		await command
			.excute({
				client: client,
				interaction: interaction as ContextMenuCommandInteraction,
				options: interaction.options as CommandInteractionOptionResolver,
			})
			.catch((err: Error) => {
				interaction.deferred
					? interaction.followUp(t('common.errors.occurred'))
					: interaction.reply(t('common.errors.occurred'));
				logger.error({
					source: `${interaction.commandName} context menu`,
					reason: err,
				});
			});

		if (command.interaction.cooldown && !client.config.general.developers.includes(interaction.user.id)) {
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
