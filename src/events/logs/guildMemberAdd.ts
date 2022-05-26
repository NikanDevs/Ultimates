import { client } from '../..';
import { Event } from '../../structures/Event';
import { leftMembersModel } from '../../models/leftMembers';
import { logActivity } from '../../functions/logs/checkActivity';
import { guild as guildConfig } from '../../json/config.json';

export default new Event('guildMemberAdd', async (member) => {
	if (!logActivity('servergate')) return;
	if (member.guild.id !== guildConfig.id) return;

	const embed = client.util
		.embed()
		.setAuthor({ name: member.guild.name, iconURL: member.guild.iconURL() })
		.setColor(client.util.resolve.color('#529e79'))
		.setDescription(
			[
				`• **Mention:** ${member}\n`,
				`• **User:** ${member.user.tag} • ${member.user.id}`,
				`• **Registered:** <t:${~~(member.user.createdTimestamp / 1000)}:R>`,
				`• **Joined:** <t:${~~(member.joinedTimestamp / 1000)}:R>`,
				`• **Member Count:** ${member.guild.memberCount}`,
			].join('\n')
		);

	// If the member has any previous experience joining the server
	const findData = await leftMembersModel.findOne({ userId: member.user.id });
	if (findData) {
		const { roles } = findData;
		await member.roles.set(roles);
		await findData.delete();
		embed.setDescription(embed.description + '\n\nA user has joined back!');
	} else {
		embed.setDescription(embed.description + '\n\nA user has joined!');
	}

	// Sending the member joined message.
	client.webhooks.servergate?.send({ embeds: [embed] });
});
