import { ChannelType, EmbedBuilder, GuildChannel } from 'discord.js';
import { Command } from '../../structures/Command';
import { interactions } from '../../interactions';
import { MAX_FIELD_VALUE_LENGTH } from '../../constants';
import { splitText } from '../../functions/other/splitText';

export default new Command({
	interaction: interactions.lockdown,
	excute: async ({ client, interaction, options }) => {
		const getSubCommand = options.getSubcommand() as 'channel' | 'server';
		const role = client.config.general.guild.memberRoleId
			? client.config.general.guild.memberRoleId
			: interaction.guild.roles.everyone;

		if (getSubCommand === 'channel') {
			const channel = (options.getChannel('channel') ||
				interaction.channel) as GuildChannel;
			const alreadyLocked = channel
				.permissionsFor(role)
				.toArray()
				.includes('SendMessages' || 'Connect')
				? false
				: true;

			const embed = new EmbedBuilder()
				.setColor(!alreadyLocked ? client.cc.moderation : client.cc.invisible)
				.setAuthor({
					name: 'Channel ' + (!alreadyLocked ? 'Locked' : 'Unlocked'),
					iconURL: client.user.displayAvatarURL(),
				})
				.setDescription(
					!alreadyLocked
						? 'This channel was locked down by a moderator!\nYou are not muted!\n\nPlease be patient until the channel gets unlocked'
						: 'This channel was unlocked by a moderator!\n\nYou can now use the channel, thanks for your patient.'
				);

			if (options.getString('reason'))
				embed.addFields([
					{
						name: 'Reason',
						value: splitText(options.getString('reason'), MAX_FIELD_VALUE_LENGTH),
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
						embeds: [
							client.embeds.attention(
								'You can only lock text, voice and stage channels.'
							),
						],
						ephemeral: true,
					});
			}

			await interaction.reply({
				embeds: [
					client.embeds.success(
						`${channel} was ${!alreadyLocked ? 'locked' : 'unlocked'}.`
					),
				],
			});

			if (channel.isText()) channel.send({ embeds: [embed] });
		} else if (getSubCommand === 'server') {
			await interaction.deferReply();
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
					!alreadyLocked
						? ch.permissionsFor(role).toArray().includes('SendMessages')
						: true
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
					name: 'Server ' + (!alreadyLocked ? 'Locked' : 'Unlocked'),
					iconURL: client.user.displayAvatarURL(),
				})
				.setDescription(
					!alreadyLocked
						? 'This server was locked down by a moderator!\nYou are not muted!\n\nPlease be patient until the server gets unlocked'
						: 'This server was unlocked by a moderator!\n\nYou can now use it, thanks for your patient.'
				);
			if (options.getString('reason'))
				embed.addFields([
					{
						name: 'Reason',
						value: splitText(options.getString('reason'), MAX_FIELD_VALUE_LENGTH),
					},
				]);
			interaction.channel.send({
				embeds: [embed],
			});
			await interaction.followUp({
				embeds: [
					client.embeds.success(
						`${interaction.guild.name} was ${
							!alreadyLocked ? 'locked' : 'unlocked'
						}.`
					),
				],
			});
		}
	},
});
