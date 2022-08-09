import { ChannelType, EmbedBuilder, GuildChannel, TextChannel } from 'discord.js';
import { Command } from '../../structures/Command';
import { interactions } from '../../interactions';
import { guardCollection } from '../../constants';
import { t } from 'i18next';

export default new Command({
	interaction: interactions.lockdown,
	excute: async ({ client, interaction, options }) => {
		const getSubCommand = options.getSubcommand() as 'channel' | 'server';
		const reason = options.getString('reason');
		const role = client.config.general.memberRoleId ?? interaction.guild.roles.everyone;

		if (getSubCommand === 'channel') {
			const channel = (options.getChannel('channel') || interaction.channel) as GuildChannel;
			const alreadyLocked = channel
				.permissionsFor(role)
				.toArray()
				.includes('SendMessages' || 'Connect')
				? false
				: true;

			const embed = new EmbedBuilder()
				.setColor(!alreadyLocked ? client.cc.moderation : client.cc.invisible)
				.setAuthor({
					name: !alreadyLocked
						? t('command.mod.lockdown.channel.lock', { context: 'title' })
						: t('command.mod.lockdown.channel.unlock', { context: 'title' }),
					iconURL: client.user.displayAvatarURL(),
				})
				.setDescription(
					!alreadyLocked
						? t('command.mod.lockdown.channel.lock', { context: 'description' })
						: t('command.mod.lockdown.channel.unlock', { context: 'description' })
				);

			if (reason)
				embed.addFields([
					{
						name: t('command.mod.lockdown.reason'),
						value: reason,
					},
				]);

			switch (channel.type) {
				case ChannelType.GuildText:
					await channel.permissionOverwrites.edit(role, {
						SendMessages: alreadyLocked ? null : false,
						SendMessagesInThreads: alreadyLocked ? null : false,
						CreatePrivateThreads: alreadyLocked ? null : false,
						CreatePublicThreads: alreadyLocked ? null : false,
						UseApplicationCommands: alreadyLocked ? null : false,
					});
					break;
				case ChannelType.GuildVoice:
				case ChannelType.GuildStageVoice:
					await channel.permissionOverwrites.edit(role, {
						Connect: alreadyLocked ? null : false,
						SendMessages: alreadyLocked ? null : false,
						UseApplicationCommands: alreadyLocked ? null : false,
					});
					break;
				default:
					return interaction.reply({
						embeds: [client.embeds.attention(t('command.mod.lockdown.channel.invalidChannel'))],
						ephemeral: true,
					});
			}

			await interaction.reply({
				embeds: [
					client.embeds.success(
						!alreadyLocked
							? t('command.mod.lockdown.channel.lock', {
									context: 'respond',
									channel: channel.toString(),
							  })
							: t('command.mod.lockdown.channel.unlock', {
									context: 'respond',
									channel: channel.toString(),
							  })
					),
				],
			});

			(channel as TextChannel).send({ embeds: [embed] });
		} else if (getSubCommand === 'server') {
			if (guardCollection.has('lockdown'))
				return interaction.reply({
					embeds: [client.embeds.attention(t('command.mod.lockdown.server.locking'))],
					ephemeral: true,
				});

			await interaction.deferReply();
			guardCollection.set('lockdown', null);
			await interaction.guild.channels.fetch();

			const alreadyLocked = interaction.guild.channels.cache
				.filter(
					(ch) =>
						ch.type === ChannelType.GuildText ||
						ch.type === ChannelType.GuildVoice ||
						ch.type === ChannelType.GuildStageVoice
				)
				.filter((ch) => ch.permissionsFor(role).toArray().includes('ViewChannel'))
				.random()
				.permissionsFor(role)
				.toArray()
				.includes('SendMessages')
				? false
				: true;

			interaction.guild.channels.cache
				.filter(
					(ch) =>
						ch.type === ChannelType.GuildText ||
						ch.type === ChannelType.GuildVoice ||
						ch.type === ChannelType.GuildStageVoice
				)
				.filter((ch) => ch.permissionsFor(role).toArray().includes('ViewChannel'))
				.filter((ch) =>
					!alreadyLocked ? ch.permissionsFor(role).toArray().includes('SendMessages') : true
				)
				.forEach(async (ch) => {
					switch (ch.type) {
						case ChannelType.GuildText:
							await ch.permissionOverwrites.edit(role, {
								SendMessages: alreadyLocked ? null : false,
								SendMessagesInThreads: alreadyLocked ? null : false,
								CreatePrivateThreads: alreadyLocked ? null : false,
								CreatePublicThreads: alreadyLocked ? null : false,
								UseApplicationCommands: alreadyLocked ? null : false,
							});
							break;
						case ChannelType.GuildVoice:
						case ChannelType.GuildStageVoice:
							await ch.permissionOverwrites.edit(role, {
								Connect: alreadyLocked ? null : false,
								SendMessages: alreadyLocked ? null : false,
								UseApplicationCommands: alreadyLocked ? null : false,
							});
							break;
					}
				});

			const embed = new EmbedBuilder()
				.setColor(!alreadyLocked ? client.cc.moderation : client.cc.invisible)
				.setAuthor({
					name: !alreadyLocked
						? t('command.mod.lockdown.server.lock', { context: 'title' })
						: t('command.mod.lockdown.server.unlock', { context: 'title' }),
					iconURL: client.user.displayAvatarURL(),
				})
				.setDescription(
					!alreadyLocked
						? t('command.mod.lockdown.server.lock', { context: 'description' })
						: t('command.mod.lockdown.server.unlock', { context: 'description' })
				);
			if (reason)
				embed.addFields([
					{
						name: t('command.mod.lockdown.reason'),
						value: reason,
					},
				]);
			interaction.channel.send({
				embeds: [embed],
			});
			await interaction.followUp({
				embeds: [
					client.embeds.success(
						!alreadyLocked
							? t('command.mod.lockdown.server.lock', { context: 'respond' })
							: t('command.mod.lockdown.server.unlock', { context: 'respond' })
					),
				],
			});

			guardCollection.delete('lockdown');
		}
	},
});
