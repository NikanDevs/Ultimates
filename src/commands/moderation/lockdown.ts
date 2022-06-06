import {
	ChannelType,
	EmbedBuilder,
	GuildChannel,
	Message,
	Snowflake,
	TextChannel,
} from 'discord.js';
import { lockdownsModel } from '../../models/lockdowns';
import { Command } from '../../structures/Command';
import { guild as guildConfig } from '../../json/config.json';
import { interactions } from '../../interactions';
interface messageIdInterface {
	channelId: Snowflake;
	messageId: Snowflake | null;
}
const messageIdsArray: messageIdInterface[] = [];
let messageId: Snowflake;

export default new Command({
	interaction: interactions.lockdown,
	excute: async ({ client, interaction, options }) => {
		const getSubCommand = options.getSubcommand() as 'channel' | 'server';

		if (getSubCommand === 'channel') {
			const channel = (options.getChannel('channel') ||
				interaction.channel) as GuildChannel;
			const alreadyLocked = channel
				.permissionsFor(guildConfig.memberRoleId)
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
						value: options.getString('reason'),
					},
				]);

			switch (channel.type) {
				case ChannelType.GuildText:
					await channel.permissionOverwrites.edit(guildConfig.memberRoleId, {
						SendMessages: alreadyLocked ? null : false,
						SendMessagesInThreads: alreadyLocked ? null : false,
						CreatePrivateThreads: alreadyLocked ? null : false,
						CreatePublicThreads: alreadyLocked ? null : false,
					});
					if (!alreadyLocked) {
						var msg = (await (channel as TextChannel).send({
							embeds: [embed],
						})) as Message;
						messageId = msg.id;
					}
					break;

				case ChannelType.GuildVoice:
				case ChannelType.GuildStageVoice:
					if (!alreadyLocked) {
						await channel.permissionOverwrites.edit(guildConfig.memberRoleId, {
							Connect: false,
						});
					} else if (alreadyLocked) {
						await channel.permissionOverwrites.edit(guildConfig.memberRoleId, {
							SendMessages: true,
						});
					}
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

			if (!alreadyLocked) {
				var data = new lockdownsModel({
					type: 'CHANNEL',
					channelId: channel.id,
					messageId: messageId,
				});
				await data.save();
			} else if (alreadyLocked) {
				const data = await lockdownsModel.findOne({
					type: 'CHANNEL',
					channelId: channel.id,
				});
				if (!data) (channel as TextChannel).send({ embeds: [embed] });

				const getMessage = (await (channel as TextChannel).messages
					.fetch(data.messageId)
					.catch(() => {})) as Message;
				getMessage.edit({
					embeds: [embed],
				});

				await data.delete();
			}
		} else if (getSubCommand === 'server') {
			await interaction.deferReply();
			const generalChannel = (await interaction.guild.channels.fetch(
				guildConfig.generalChannelId
			)) as TextChannel;
			const alreadyLocked = generalChannel
				.permissionsFor(guildConfig.memberRoleId)
				.toArray()
				.includes('SendMessages')
				? false
				: true;

			(await interaction.guild.channels.fetch())
				.filter(
					(ch) =>
						ch.type === ChannelType.GuildText ||
						ch.type === ChannelType.GuildVoice ||
						ch.type === ChannelType.GuildStageVoice
				)
				.filter((ch) =>
					ch
						.permissionsFor(guildConfig.memberRoleId)
						.toArray()
						.includes('ViewChannel')
				)
				.filter((ch) =>
					!alreadyLocked
						? ch
								.permissionsFor(interaction.guild.roles.everyone)
								.toArray()
								.includes('SendMessages')
						: true
				)
				.forEach(async (ch) => {
					switch (ch.type) {
						case ChannelType.GuildText:
							await ch.permissionOverwrites.edit(guildConfig.memberRoleId, {
								SendMessages: alreadyLocked ? null : false,
								SendMessagesInThreads: alreadyLocked ? null : false,
								CreatePrivateThreads: alreadyLocked ? null : false,
								CreatePublicThreads: alreadyLocked ? null : false,
							});
							if (ch.id !== generalChannel.id)
								messageIdsArray.push({ channelId: ch.id, messageId: null });
							break;
						case ChannelType.GuildVoice:
						case ChannelType.GuildStageVoice:
							await ch.permissionOverwrites.edit(guildConfig.memberRoleId, {
								Connect: alreadyLocked ? null : false,
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
						value: options.getString('reason'),
					},
				]);
			generalChannel.send({
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

			// Sending messages in all needed channels.
			if (!alreadyLocked) {
				var count = 0;
				messageIdsArray
					.filter((ch) => ch.channelId !== interaction.channelId)
					.forEach(async (data, _index, array) => {
						const getChannel = interaction.guild.channels.cache.get(
							data.channelId
						) as TextChannel;
						var msg = (await getChannel.send({
							content: `This server is currently on a lockdown, visit ${generalChannel} for more information!`,
						})) as Message;

						data.messageId = msg.id;
						count++;

						if (count === array.length) saveInDB();
					});

				function saveInDB() {
					const data = new lockdownsModel({
						type: 'SERVER',
						messagesArray: messageIdsArray,
					});
					data.save();
				}
			} else if (alreadyLocked) {
				const findData = await lockdownsModel.findOne({ type: 'SERVER' });
				if (!findData) return;
				const array: messageIdInterface[] = findData.messagesArray;

				let count = 0;
				array.forEach(async (data, _index, array) => {
					const getChannel = (await interaction.guild.channels
						.fetch(data.channelId)
						.catch(() => {})) as TextChannel;
					const getMessage = (await getChannel.messages
						.fetch(data.messageId)
						.catch(() => {})) as Message;

					getMessage?.delete().catch(() => {});
					count++;

					if (count === array.length) await findData.delete();
				});
			}
		}
	},
});
