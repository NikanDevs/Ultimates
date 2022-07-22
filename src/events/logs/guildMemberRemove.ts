import { client } from '../..';
import { Event } from '../../structures/Event';
import { leftMembersModel } from '../../models/leftMembers';
import { guardCollection, leftMemberExpiry } from '../../constants';
import { logActivity } from '../../functions/logs/checkActivity';
import { EmbedBuilder } from 'discord.js';

export default new Event('guildMemberRemove', async (member) => {
	if (member.guild.id !== process.env.GUILD_ID) return;

	const roles = member.roles.cache
		.filter((r) => r.id !== member.guild.id)
		.filter((r) => !r.managed)
		.map((role) => role.id);

	const embed = new EmbedBuilder()
		.setAuthor({ name: member.guild.name, iconURL: member.guild.iconURL() })
		.setColor(client.cc.invisible)
		.setDescription(
			[
				`• **Mention:** ${member}\n`,
				`• **Member:** ${member.user.tag} • ${member.user.id}`,
				`• **Registered:** <t:${~~(member.user.createdTimestamp / 1000)}:R>`,
				`• **Joined:** <t:${~~(member.joinedTimestamp / 1000)}:R>`,
				`• **Left:** <t:${~~(Date.now() / 1000)}:R>`,
				`• **Member Count:** ${member.guild.memberCount}`,
				`\nMember Left! ${checkAntiraid(member.id) ? 'Most likely affected by the antiraid.' : ''}`,
			].join('\n')
		);

	// Saving the roles if the member has any
	if (!member.user.bot && roles.length && !checkAntiraid(member.id)) {
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

function checkAntiraid(id: string): boolean {
	const antiraidData = guardCollection.get('antiraid');
	if (!antiraidData) return false;
	if (!antiraidData.includes(id)) return false;

	return true;
}
