import { Event } from '../../structures/Event';
import { AuditLogEvent } from 'discord-api-types/v9';
import { punishmentModel } from '../../models/punishments';
import { PunishmentType } from '../../typings/PunishmentType';
import { punishmentExpiry } from '../../constants';
import { generateManualId } from '../../utils/generatePunishmentId';
import { getModCase } from '../../functions/cases/modCase';
import { createModLog } from '../../functions/logs/createModLog';
import { guildId } from '../../json/config.json';
import { User } from 'discord.js';
import { client } from '../..';

export default new Event('guildMemberRemove', async (member) => {
	if (member.guild.id !== guildId) return;
	if (member.user.bot) return;
	if (await member.guild.bans.fetch(member.user).catch(() => {})) return;

	const auditLogs = await member.guild.fetchAuditLogs({
		limit: 10,
		type: AuditLogEvent.MemberKick,
	});
	const findCase = auditLogs.entries.find((log) => (log.target as User).id === member.id);
	if (!findCase) return;
	const { executor, reason } = findCase;
	if (executor.bot) return;

	const data_ = new punishmentModel({
		_id: await generateManualId(),
		case: await getModCase(),
		type: PunishmentType.Kick,
		userId: member.id,
		moderatorId: executor.id,
		reason: reason || client.config.moderation.default.reason,
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
