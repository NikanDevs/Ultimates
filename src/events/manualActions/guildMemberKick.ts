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

export default new Event('guildMemberRemove', async (member) => {
	if (member.guild.id !== process.env.GUILD_ID) return;
	if (member.user.bot) return;
	if (await member.guild.bans.fetch(member.user).catch(() => {})) return;

	const auditLogs = await member.guild.fetchAuditLogs({
		limit: 1,
		type: AuditLogEvent.MemberKick,
	});
	const findCase = auditLogs.entries.find((log) => (log.target as User).id === member.id);
	if (!findCase) return;
	const { executor, reason } = findCase;
	if (executor.bot) return;

	const data_ = new punishmentModel({
		_id: await generateManualId(),
		case: await getModCase(),
		type: PunishmentTypes.Kick,
		userId: member.id,
		moderatorId: executor.id,
		reason: reason ?? t('common.noReason'),
		date: new Date(),
		expire: punishmentExpiry,
	});
	await data_.save();

	await createModLog({
		action: PunishmentTypes.Kick,
		punishmentId: data_._id,
		user: member.user,
		moderator: executor,
		reason: reason,
		expire: punishmentExpiry,
	});
});
