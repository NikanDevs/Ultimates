import { Event } from '../../structures/Event';
import { AuditLogEvent } from 'discord-api-types/v9';
import { punishmentModel } from '../../models/punishments';
import { PunishmentTypes } from '../../typings';
import { punishmentExpiry } from '../../constants';
import { generateManualId } from '../../utils/generatePunishmentId';
import { getModCase } from '../../functions/cases/modCase';
import { createModLog } from '../../functions/logs/createModLog';
import { User } from 'discord.js';
import { client } from '../..';

export default new Event('guildBanRemove', async (ban) => {
	if (ban.guild.id !== process.env.GUILD_ID) return;
	if (ban.user.bot) return;

	const auditLogs = await ban.guild.fetchAuditLogs({
		limit: 1,
		type: AuditLogEvent.MemberBanRemove,
	});
	const findCase = auditLogs.entries.find((log) => (log.target as User).id === ban.user.id);
	if (!findCase) return;
	const { executor, reason } = findCase;
	if (executor.bot) return;

	const data_ = new punishmentModel({
		_id: await generateManualId(),
		case: await getModCase(),
		type: PunishmentTypes.Unban,
		userId: ban.user.id,
		moderatorId: executor.id,
		reason: reason || client.config.moderation.default.reason,
		date: new Date(),
		expire: punishmentExpiry,
	});
	await data_.save();

	await createModLog({
		action: PunishmentTypes.Unban,
		punishmentId: data_._id,
		user: ban.user,
		moderator: executor,
		reason: reason,
	});
});
