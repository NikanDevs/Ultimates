import { client } from '../..';
import { Event } from '../../structures/Event';
import { leftMembersModel } from '../../models/leftMembers';
import { leftMemberExpiry } from '../../constants';
import { logActivity } from '../../functions/logs/checkActivity';
import { guildId } from '../../json/config.json';
import { EmbedBuilder } from 'discord.js';

export default new Event('guildMemberRemove', async (member) => {
	if (member.guild.id !== guildId) return;

	const roles = member.roles.cache
		.filter((r) => r.id !== member.guild.id)
		.map((role) => role.id);

	const embed = new EmbedBuilder()
		.setAuthor({ name: member.guild.name, iconURL: member.guild.iconURL() })
		.setColor(client.util.resolve.color('#b55c4e'))
		.setDescription(
			[
				`• **Mention:** ${member}\n`,
				`• **Member:** ${member.user.tag} • ${member.user.id}`,
				`• **Registered:** <t:${~~(member.user.createdTimestamp / 1000)}:R>`,
				`• **Joined:** <t:${~~(member.joinedTimestamp / 1000)}:R>`,
				`• **Left:** <t:${~~(Date.now() / 1000)}:R>`,
				`• **Member Count:** ${member.guild.memberCount}`,
				'\nThe member has left!',
			].join('\n')
		);

	// Saving the roles if the member has any
	if (roles.length !== 0) {
		new leftMembersModel({
			userId: member.user.id,
			roles: roles,
			expire: leftMemberExpiry,
		}).save();
	}

	if (logActivity('servergate'))
		// Sending the left message
		client.config.webhooks.servergate?.send({ embeds: [embed] });
});
