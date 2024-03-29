import { Event } from '../../structures/Event';
import { AuditLogEvent } from 'discord-api-types/v9';
import { punishmentModel } from '../../models/punishments';
import { PunishmentTypes } from '../../typings';
import { punishmentExpiry } from '../../constants';
import { generateManualId } from '../../utils/generatePunishmentId';
import { getModCase } from '../../functions/cases/modCase';
import { createModLog } from '../../functions/logs/createModLog';
import { User } from 'discord.js';
import { t } from 'i18next';

export default new Event('guildBanAdd', async (ban) => {
	if (ban.guild.id !== process.env.GUILD_ID) return;
	if (ban.user.bot) return;

	const auditLogs = await ban.guild.fetchAuditLogs({
		limit: 1,
		type: AuditLogEvent.MemberBanAdd,
	});

	const findCase = auditLogs.entries.find((log) => (log.target as User).id === ban.user.id);
	if (!findCase) return;

	const { executor, reason, createdTimestamp } = findCase;
	if (executor.bot) return;
	if (Date.now() - createdTimestamp > 10 * 1000) return;

	const data_ = new punishmentModel({
		_id: await generateManualId(),
		case: await getModCase(),
		type: PunishmentTypes.Ban,
		userId: ban.user.id,
		moderatorId: executor.id,
		reason: reason ?? t('common.noReason'),
		date: new Date(),
		expire: punishmentExpiry,
	});
	await data_.save();

	await createModLog({
		action: PunishmentTypes.Ban,
		punishmentId: data_._id,
		user: ban.user,
		moderator: executor,
		reason: reason,
		expire: punishmentExpiry,
	});
});
