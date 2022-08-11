import { client } from '../..';
import { Event } from '../../structures/Event';
import { leftMembersModel } from '../../models/leftMembers';
import { logActivity } from '../../functions/logs/checkActivity';
import { ColorResolvable, EmbedBuilder, resolveColor } from 'discord.js';
import { t } from 'i18next';
import { generateDiscordTimestamp } from '../../utils/generateDiscordTimestamp';

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
				`${t('event.logs.guildMemberJL.mention', { mention: member.toString() })}\n`,
				t('event.logs.guildMemberJL.user', { tag: member.user.tag, id: member.id }),
				t('event.logs.guildMemberJL.registered', { date: generateDiscordTimestamp(member.user.createdAt) }),
				t('event.logs.guildMemberJL.joined', { date: generateDiscordTimestamp(member.joinedAt) }),
				t('event.logs.guildMemberJL.memberCount', { count: member.guild.memberCount }),
				`\n${
					rolesData
						? t('event.logs.guildMemberJL.joined', { context: 'back' })
						: t('event.logs.guildMemberJL.joined', { context: 'first' })
				}`,
			].join('\n')
		);

	if (logActivity('servergate')) client.config.webhooks.servergate?.send({ embeds: [embed] });
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
