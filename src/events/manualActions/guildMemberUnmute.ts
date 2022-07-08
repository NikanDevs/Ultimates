import { Event } from '../../structures/Event';
import { AuditLogEvent } from 'discord-api-types/v9';
import { punishmentModel } from '../../models/punishments';
import { PunishmentTypes } from '../../typings';
import { warningExpiry } from '../../constants';
import { durationsModel } from '../../models/durations';
import { getModCase } from '../../functions/cases/modCase';
import { generateManualId } from '../../utils/generatePunishmentId';
import { createModLog } from '../../functions/logs/createModLog';
import { User } from 'discord.js';
import { t } from 'i18next';

export default new Event('guildMemberUpdate', async (oldMember, newMember) => {
	if (newMember.guild.id !== process.env.GUILD_ID) return;
	if (newMember.user.bot) return;

	await oldMember.fetch().catch(() => {});
	if (oldMember.communicationDisabledUntil && !newMember.communicationDisabledUntil) {
		const auditLogs = await newMember.guild.fetchAuditLogs({
			limit: 1,
			type: AuditLogEvent.MemberUpdate,
		});

		const findCase = auditLogs.entries.find(
			(log) => (log.target as User).id === newMember.user.id
		);
		if (!findCase) return;
		const { executor, reason, createdTimestamp } = findCase;
		if (executor.bot) return;
		if (Date.now() - createdTimestamp > 10 * 1000) return;

		// Finding the proper case
		const findTimeout = await durationsModel.findOne({
			type: PunishmentTypes.Timeout,
			userId: newMember.id,
		});

		const data_ = new punishmentModel({
			_id: await generateManualId(),
			case: await getModCase(),
			type: PunishmentTypes.Unmute,
			userId: newMember.user.id,
			moderatorId: executor.id,
			reason: reason ?? t('common.noReason'),
			date: new Date(),
			expire: warningExpiry,
		});
		await data_.save();

		await createModLog({
			action: PunishmentTypes.Unmute,
			punishmentId: data_._id,
			user: newMember.user,
			moderator: executor,
			reason: reason,
		}).then(async () => {
			if (!findTimeout || findTimeout === undefined) return;
			await findTimeout.delete();
		});
	}
});
