import { Event } from '../../structures/Event';
import { AuditLogEvent } from 'discord-api-types/v9';
import { punishmentModel } from '../../models/punishments';
import { PunishmentType } from '../../typings/PunishmentType';
import { warningExpiry } from '../../constants';
import { durationsModel } from '../../models/durations';
import { logsModel } from '../../models/logs';
import { getModCase } from '../../functions/cases/modCase';
import { generateManualId } from '../../utils/generatePunishmentId';
import { createModLog } from '../../functions/logs/createModLog';
import { client } from '../..';

export default new Event('guildMemberUpdate', async (oldMember, newMember) => {
	if (newMember.guild.id !== client.server.id) return;
	await oldMember.fetch().catch(() => {});
	if (oldMember.communicationDisabledUntil && !newMember.communicationDisabledUntil) {
		const auditLogs = await newMember.guild.fetchAuditLogs({
			limit: 10,
			type: AuditLogEvent['MemberUpdate'],
		});

		const findCase = auditLogs.entries.find((log) => log.target.id === newMember.user.id);
		if (!findCase) return;
		const { executor, reason } = findCase;
		if (executor.bot) return;

		const data_ = new punishmentModel({
			_id: generateManualId(),
			case: await getModCase(),
			type: PunishmentType.Unmute,
			userId: newMember.user.id,
			moderatorId: executor.id,
			reason: reason,
			date: new Date(),
			expire: warningExpiry,
		});
		await data_.save();

		await createModLog({
			action: PunishmentType.Unmute,
			punishmentId: data_._id,
			user: newMember.user,
			moderator: executor,
			reason: reason,
		});
	}
});
