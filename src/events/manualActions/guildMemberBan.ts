import { Event } from '../../structures/Event';
import { AuditLogEvent } from 'discord-api-types/v9';
import { punishmentModel } from '../../models/punishments';
import { PunishmentType } from '../../typings/PunishmentType';
import { client } from '../..';
import { banSystemExpiry } from '../../constants';
import { GuildMember } from 'discord.js';
import { generateManualId } from '../../utils/generatePunishmentId';
import { getModCase } from '../../functions/cases/modCase';
import { createModLog } from '../../functions/logs/createModLog';

export default new Event('guildBanAdd', async (ban) => {
	if (ban.guild.id !== client.server.id) return;

	const auditLogs = await ban.guild.fetchAuditLogs({
		limit: 10,
		type: AuditLogEvent['MemberBanAdd'],
	});
	const findCase = auditLogs.entries.find((log) => log.target.id === ban.user.id);
	if (!findCase) return;
	const { executor, reason } = findCase;
	if (executor.bot) return;

	const data_ = new punishmentModel({
		_id: generateManualId(),
		case: await getModCase(),
		type: PunishmentType.Ban,
		userId: ban.user.id,
		moderatorId: executor.id,
		reason: reason || 'No reason was provided!',
		timestamp: Date.now(),
		expires: banSystemExpiry,
	});
	await data_.save();

	await createModLog(ban as GuildMember, {
		action: PunishmentType.Ban,
		punishmentId: data_._id,
		user: ban.user,
		moderator: executor,
		reason: reason || 'No reason was provided!',
	});
});
