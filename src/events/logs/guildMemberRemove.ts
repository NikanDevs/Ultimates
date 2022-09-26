import { client } from '../..';
import { Event } from '../../structures/Event';
import { leftMembersModel } from '../../models/leftMembers';
import { guardCollection, leftMemberExpiry } from '../../constants';
import { logActivity } from '../../functions/logs/checkActivity';
import { EmbedBuilder } from 'discord.js';
import { generateDiscordTimestamp } from '../../utils/generateDiscordTimestamp';
import { t } from 'i18next';

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
				`${t('event.logs.guildMemberJL.mention', { mention: member.toString() })}\n`,
				t('event.logs.guildMemberJL.user', { tag: member.user.tag, id: member.id }),
				t('event.logs.guildMemberJL.registered', { date: generateDiscordTimestamp(member.user.createdAt) }),
				t('event.logs.guildMemberJL.joined', { date: generateDiscordTimestamp(member.joinedAt) }),
				t('event.logs.guildMemberJL.left', { date: generateDiscordTimestamp(new Date()) }),
				t('event.logs.guildMemberJL.memberCount', { count: member.guild.memberCount }),
				`\n${t('event.logs.guildMemberJL.left', {
					context: checkAntiraid(member.id) ? 'antiraid' : 'normal',
				})}\n`,
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
		client.config.logging.webhook.send({ threadId: client.config.logging.servergate.channelId, embeds: [embed] });
});

function checkAntiraid(id: string): boolean {
	const antiraidData = guardCollection.get('antiraid');
	if (!antiraidData) return false;
	if (!antiraidData.includes(id)) return false;

	return true;
}
