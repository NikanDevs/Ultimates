import { EmbedBuilder, resolveColor } from 'discord.js';
import { client } from '../..';
import { logActivity } from '../../functions/logs/checkActivity';
import { Event } from '../../structures/Event';
import { generateDiscordTimestamp } from '../../utils/generateDiscordTimestamp';

export default new Event('voiceStateUpdate', async (oldState, newState) => {
	if (!logActivity('voice')) return;

	if (
		!newState.guild ||
		newState.guild.id !== process.env.GUILD_ID ||
		client.config.ignores.logs.voice.channelIds.includes(newState.channelId) ||
		client.config.ignores.logs.voice.channelIds.includes(oldState.channelId) ||
		client.config.ignores.logs.voice.roleIds.some((role) => newState?.member?.roles?.cache.has(role)) ||
		client.config.ignores.logs.voice.roleIds.some((role) => oldState?.member?.roles?.cache.has(role))
	)
		return;

	if (!oldState.channel && newState.channel) {
		const embed = new EmbedBuilder()
			.setAuthor({
				name: newState.member.user.tag,
				iconURL: newState.member.user.displayAvatarURL(),
			})
			.setDescription(`Joined ${newState.channel} • ${generateDiscordTimestamp(new Date())}`)
			.addFields([
				{
					name: 'IDs',
					value: `\`\`\`ini\nMember = ${newState.member.id}\`\`\``,
				},
			])
			.setColor(resolveColor('#9edadb'));

		client.config.webhooks.voice.send({ embeds: [embed] });
	} else if (oldState.channel && !newState.channel) {
		const embed = new EmbedBuilder()
			.setAuthor({
				name: newState.member.user.tag,
				iconURL: newState.member.user.displayAvatarURL(),
			})
			.setDescription(`Left ${oldState.channel} • ${generateDiscordTimestamp(new Date())}`)
			.addFields([
				{
					name: 'IDs',
					value: `\`\`\`ini\nMember = ${oldState.member.id}\`\`\``,
				},
			])
			.setColor(resolveColor('#d98d84'));

		client.config.webhooks.voice.send({ embeds: [embed] });
	} else if (oldState.channel && newState.channel && oldState.channelId !== newState.channelId) {
		const embed = new EmbedBuilder()
			.setAuthor({
				name: newState.member.user.tag,
				iconURL: newState.member.user.displayAvatarURL(),
			})
			.setDescription(
				`Moved from ${oldState.channel} to ${newState.channel} • ${generateDiscordTimestamp(new Date())}`
			)
			.addFields([
				{
					name: 'IDs',
					value: `\`\`\`ini\nMember = ${oldState.member.id}\`\`\``,
				},
			])
			.setColor(resolveColor('#887fdb'));

		client.config.webhooks.voice.send({ embeds: [embed] });
	}
});
