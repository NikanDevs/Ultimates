import { Event } from '../../structures/Event';
import { AuditLogEvent } from 'discord-api-types/v9';
import { punishmentModel } from '../../models/punishments';
import { PunishmentType } from '../../typings/PunishmentType';
import { client } from '../..';
import { manualWarningExpiry } from '../../constants';
import { GuildMember } from 'discord.js';
import { generateManualId } from '../../utils/generatePunishmentId';
import { getModCase } from '../../functions/cases/modCase';
import { createModLog } from '../../functions/logs/createModLog';

export default new Event('guildMemberRemove', async (member) => {
	if (member.guild.id !== client.server.id) return;
	if (await member.guild.bans.fetch(member.user).catch(() => {})) return;

	const auditLogs = await member.guild.fetchAuditLogs({
		limit: 10,
		type: AuditLogEvent['MemberKick'],
	});
	const findCase = auditLogs.entries.find((log) => log.target.id === member.id);
	if (!findCase) return;
	const { executor, reason } = findCase;
	if (executor.bot) return;

	const data_ = new punishmentModel({
		_id: generateManualId(),
		case: await getModCase(),
		type: PunishmentType.Kick,
		userId: member.id,
		moderatorId: executor.id,
		reason: reason || 'No reason was provided!',
		timestamp: Date.now(),
		expires: manualWarningExpiry,
	});
	await data_.save();

	await createModLog(member as GuildMember, {
		action: PunishmentType.Kick,
		punishmentId: data_._id,
		user: member.user,
		moderator: executor,
		reason: reason || 'No reason was provided!',
	});
});
