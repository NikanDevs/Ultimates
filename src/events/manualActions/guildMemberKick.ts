import { Event } from '../../structures/Event';
import { AuditLogEvent } from 'discord-api-types/v9';
import { punishmentModel } from '../../models/punishments';
import { PunishmentType } from '../../typings/PunishmentType';
import { punishmentExpiry } from '../../constants';
import { generateManualId } from '../../utils/generatePunishmentId';
import { getModCase } from '../../functions/cases/modCase';
import { createModLog } from '../../functions/logs/createModLog';
import { default_config } from '../../json/moderation.json';
import { guild as guildConfig } from '../../json/config.json';

export default new Event('guildMemberRemove', async (member) => {
	if (member.guild.id !== guildConfig.id) return;
	if (await member.guild.bans.fetch(member.user).catch(() => {})) return;

	const auditLogs = await member.guild.fetchAuditLogs({
		limit: 10,
		type: AuditLogEvent['MemberKick'],
	});
	const findCase = auditLogs.entries.find((log) => log.target.id === member.id);
	if (!findCase) return;
	const { executor, reason } = findCase;
	if (executor.bot) return;

	const data_ = new punishmentModel({
		_id: generateManualId(),
		case: await getModCase(),
		type: PunishmentType.Kick,
		userId: member.id,
		moderatorId: executor.id,
		reason: reason || default_config.reason,
		date: new Date(),
		expire: punishmentExpiry,
	});
	await data_.save();

	await createModLog({
		action: PunishmentType.Kick,
		punishmentId: data_._id,
		user: member.user,
		moderator: executor,
		reason: reason,
		expire: punishmentExpiry,
	});
});
