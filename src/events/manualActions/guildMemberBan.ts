import { Event } from '../../structures/Event';
import { AuditLogEvent } from 'discord-api-types/v9';
import { punishmentModel } from '../../models/punishments';
import { PunishmentType } from '../../typings/PunishmentType';
import { punishmentExpiry } from '../../constants';
import { generateManualId } from '../../utils/generatePunishmentId';
import { getModCase } from '../../functions/cases/modCase';
import { createModLog } from '../../functions/logs/createModLog';
import { guild as guildConfig } from '../../json/config.json';
import { User } from 'discord.js';
import { client } from '../..';

export default new Event('guildBanAdd', async (ban) => {
	if (ban.guild.id !== guildConfig.id) return;
	if (ban.user.bot) return;

	const auditLogs = await ban.guild.fetchAuditLogs({
		limit: 10,
		type: AuditLogEvent.MemberBanAdd,
	});

	const findCase = auditLogs.entries.find((log) => (log.target as User).id === ban.user.id);
	if (!findCase) return;

	const { executor, reason } = findCase;
	if (executor.bot) return;

	const data_ = new punishmentModel({
		_id: generateManualId(),
		case: await getModCase(),
		type: PunishmentType.Ban,
		userId: ban.user.id,
		moderatorId: executor.id,
		reason: reason || client.config.moderation.default.reason,
		date: new Date(),
		expire: punishmentExpiry,
	});
	await data_.save();

	await createModLog({
		action: PunishmentType.Ban,
		punishmentId: data_._id,
		user: ban.user,
		moderator: executor,
		reason: reason,
		expire: punishmentExpiry,
	});
});
