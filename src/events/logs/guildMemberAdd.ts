import { client } from '../..';
import { Event } from '../../structures/Event';
import { leftMembersModel } from '../../models/leftMembers';
import { logActivity } from '../../functions/logs/checkActivity';
import { ColorResolvable, EmbedBuilder, resolveColor } from 'discord.js';

export default new Event('guildMemberAdd', async (member) => {
	if (member.guild.id !== process.env.GUILD_ID) return;

	// If the member has any previous experience joining the server
	const rolesData = await leftMembersModel.findOne({ userId: member.user.id });
	if (rolesData) {
		await member.roles.set(rolesData.roles);
		await rolesData.delete();
	}

	const embed = new EmbedBuilder()
		.setAuthor({ name: member.guild.name, iconURL: member.guild.iconURL() })
		.setColor(generateColor(member.user.createdAt))
		.setDescription(
			[
				`• **Mention:** ${member}\n`,
				`• **User:** ${member.user.tag} • ${member.user.id}`,
				`• **Registered:** <t:${~~(member.user.createdTimestamp / 1000)}:R>`,
				`• **Joined:** <t:${~~(member.joinedTimestamp / 1000)}:R>`,
				`• **Member Count:** ${member.guild.memberCount}`,
				`\n${rolesData ? 'A user has joined back!' : 'A user has joined!'}`,
			].join('\n')
		);

	if (logActivity('servergate'))
		// Sending the member joined message.
		client.config.webhooks.servergate?.send({ embeds: [embed] });
});

function generateColor(registered: Date): ColorResolvable {
	const timestamp = new Date(new Date().getTime() - registered.getTime()).getTime();
	let output: ColorResolvable;

	if (timestamp <= 1000 * 60 * 60 * 24) {
		output = '#b55c4e';
	} else if (timestamp <= 1000 * 60 * 60 * 24 * 7) {
		output = '#f5a742';
	} else output = '#529e79';

	return resolveColor(output);
}
