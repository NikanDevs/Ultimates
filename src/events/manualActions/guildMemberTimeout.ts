import { Event } from '../../structures/Event';
import { AuditLogEvent } from 'discord-api-types/v9';
import { punishmentModel } from '../../models/punishments';
import { PunishmentTypes } from '../../typings';
import { warningExpiry } from '../../constants';
import { generateManualId } from '../../utils/generatePunishmentId';
import { getModCase } from '../../functions/cases/modCase';
import { createModLog } from '../../functions/logs/createModLog';
import { timeoutMember } from '../../utils/timeoutMember';
import { sendModDM } from '../../utils/sendModDM';
import { User } from 'discord.js';
import { t } from 'i18next';

export default new Event('guildMemberUpdate', async (oldMember, newMember) => {
	if (newMember.guild.id !== process.env.GUILD_ID) return;
	if (newMember.user.bot) return;

	await oldMember.fetch().catch(() => {});
	if (!oldMember.communicationDisabledUntil && newMember.communicationDisabledUntil) {
		const auditLogs = await newMember.guild.fetchAuditLogs({
			limit: 1,
			type: AuditLogEvent.MemberUpdate,
		});

		const findCase = auditLogs.entries.find(
			(log) => (log.target as User).id === newMember.user.id
		);
		if (!findCase) return;
		const { executor, reason, changes } = findCase;
		if (executor.bot) return;

		const rawDuration = new Date(changes[0].new.toString()).getTime() - Date.now();
		const duration = ~~(Math.ceil(rawDuration / 1000 / 10) * 10) * 1000; // Rounding up to 10s -> 58 secs to 60 secs
		await timeoutMember(newMember, { duration: duration, reason: reason });

		const data_ = new punishmentModel({
			_id: await generateManualId(),
			case: await getModCase(),
			type: PunishmentTypes.Timeout,
			userId: newMember.user.id,
			moderatorId: executor.id,
			reason: reason ?? t('common.noReason'),
			date: new Date(),
			expire: new Date(warningExpiry.getTime() + duration),
		});
		await data_.save();

		await sendModDM(newMember, {
			action: PunishmentTypes.Timeout,
			expire: new Date(duration),
			punishment: data_,
		});

		await createModLog({
			action: PunishmentTypes.Timeout,
			punishmentId: data_._id,
			user: newMember.user,
			moderator: executor,
			reason: reason,
			duration: duration,
		});
	}
});
