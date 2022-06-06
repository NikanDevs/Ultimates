import { client } from '../..';
import { Event } from '../../structures/Event';
import { leftMembersModel } from '../../models/leftMembers';
import { logActivity } from '../../functions/logs/checkActivity';
import { guild as guildConfig } from '../../json/config.json';
import { EmbedBuilder } from 'discord.js';

export default new Event('guildMemberAdd', async (member) => {
	if (!logActivity('servergate')) return;
	if (member.guild.id !== guildConfig.id) return;

	// If the member has any previous experience joining the server
	const findData = await leftMembersModel.findOne({ userId: member.user.id });
	if (findData) {
		const { roles } = findData;
		await member.roles.set(roles);
		await findData.delete();
	}

	const embed = new EmbedBuilder()
		.setAuthor({ name: member.guild.name, iconURL: member.guild.iconURL() })
		.setColor('#529e79')
		.setDescription(
			[
				`• **Mention:** ${member}\n`,
				`• **User:** ${member.user.tag} • ${member.user.id}`,
				`• **Registered:** <t:${~~(member.user.createdTimestamp / 1000)}:R>`,
				`• **Joined:** <t:${~~(member.joinedTimestamp / 1000)}:R>`,
				`• **Member Count:** ${member.guild.memberCount}`,
				`\n${findData ? 'A user has joined back!' : 'A user has joined!'}`,
			].join('\n')
		);

	// Sending the member joined message.
	client.config.webhooks.servergate?.send({ embeds: [embed] });
});
