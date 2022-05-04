import { Event } from '../../structures/Event';
import { AuditLogEvent } from 'discord-api-types/v9';
import { punishmentModel } from '../../models/punishments';
import { PunishmentType } from '../../typings/PunishmentType';
import { client } from '../..';
import { manualWarningExpiry } from '../../constants';
import { GuildMember } from 'discord.js';
import { timeoutsModel } from '../../models/timeouts';
import { logsModel } from '../../models/logs';
import { getModCase } from '../../functions/cases/modCase';
import { generateManualId } from '../../utils/generatePunishmentId';
import { createModLog } from '../../functions/logs/createModLog';

export default new Event('guildMemberUpdate', async (oldMember, newMember) => {
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

		// Finding the proper case
		const findTimeout = await timeoutsModel.findOne({
			userId: newMember.id,
		});
		const findLogs = await logsModel.findById(findTimeout?.case);
		const data_ = new punishmentModel({
			_id: generateManualId(),
			case: await getModCase(),
			type: PunishmentType.Unmute,
			userId: newMember.user.id,
			moderatorId: executor.id,
			reason: reason,
			timestamp: Date.now(),
			expires: manualWarningExpiry,
		});
		await data_.save();

		if (findLogs && findTimeout !== undefined) {
			await createModLog(newMember as GuildMember, {
				action: PunishmentType.Unmute,
				punishmentId: data_._id,
				user: newMember.user,
				moderator: executor,
				reason: reason || 'No reason was provided!',
				referencedPunishment: { case: findLogs._id },
			}).then(() => {
				findLogs.delete();
				findTimeout.delete();
			});
		} else {
			await createModLog(newMember as GuildMember, {
				action: PunishmentType.Unmute,
				punishmentId: data_._id,
				user: newMember.user,
				moderator: executor,
				reason: reason || 'No reason was provided!',
			});
		}
	}
});
