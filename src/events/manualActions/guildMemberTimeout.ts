import { Event } from '../../structures/Event';
import { AuditLogEvent } from 'discord-api-types/v9';
import { punishmentModel } from '../../models/punishments';
import { PunishmentType } from '../../typings/PunishmentType';
import { warningExpiry } from '../../constants';
import { generateManualId } from '../../utils/generatePunishmentId';
import { getModCase } from '../../functions/cases/modCase';
import { createModLog } from '../../functions/logs/createModLog';
import { timeoutMember } from '../../utils/timeoutMember';
import { client } from '../..';

export default new Event('guildMemberUpdate', async (oldMember, newMember) => {
	if (newMember.guild.id !== client.server.id) return;
	await oldMember.fetch().catch(() => {});
	if (!oldMember.communicationDisabledUntil && newMember.communicationDisabledUntil) {
		const auditLogs = await newMember.guild.fetchAuditLogs({
			limit: 10,
			type: AuditLogEvent['MemberUpdate'],
		});

		const findCase = auditLogs.entries.find((log) => log.target.id === newMember.user.id);
		if (!findCase) return;
		const { executor, reason, changes } = findCase;
		if (executor.bot) return;

		const rawDuration = new Date(changes[0].new.toString()).getTime() - Date.now();
		const duration = ~~(Math.ceil(rawDuration / 1000 / 10) * 10) * 1000; // Rounding up to 10s -> 58 secs to 60 secs
		await timeoutMember(newMember, { duration: duration, reason: reason });

		const data_ = new punishmentModel({
			_id: generateManualId(),
			case: await getModCase(),
			type: PunishmentType.Timeout,
			userId: newMember.user.id,
			moderatorId: executor.id,
			reason: reason,
			date: new Date(),
			expire: new Date(warningExpiry.getTime() + duration),
		});
		await data_.save();

		await createModLog({
			action: PunishmentType.Timeout,
			punishmentId: data_._id,
			user: newMember.user,
			moderator: executor,
			reason: reason,
			duration: duration,
		});
	}
});
