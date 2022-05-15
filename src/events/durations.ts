import { GuildMember, User } from 'discord.js';
import { client } from '..';
import { createModLog } from '../functions/logs/createModLog';
import { logsModel } from '../models/logs';
import { durationsModel } from '../models/durations';
import { Event } from '../structures/Event';
import { PunishmentType } from '../typings/PunishmentType';

export default new Event('messageCreate', async (message) => {
	// Unmutes
	const findTimeouts = await durationsModel.find({ type: PunishmentType.Timeout });
	const filterTimeout = findTimeouts?.filter((c) => Date.now() > (c.endsAt as Date).getTime());
	if (!filterTimeout) return;

	filterTimeout.forEach(async (data) => {
		await data.delete();
		const guildMember = (await message.guild.members?.fetch(data.userId)) as GuildMember;
		const findUser = (await client.users
			.fetch(data.userId, { force: true })
			.catch(() => {})) as User;

		if (guildMember) guildMember.timeout(null, 'Timeout ended based on the duration.');

		await createModLog({
			action: PunishmentType.Unmute,
			user: findUser,
			moderator: client.user,
			reason: 'Timeout ended based on the duration.',
			referencedPunishment: data,
		});

		await logsModel.findByIdAndDelete(data.case);
	});

	// Unbans
	const findSoftbans = await durationsModel.find({ type: PunishmentType.Softban });
	const filterSoftbans = findSoftbans?.filter((c) => Date.now() > (c.endsAt as Date).getTime());
	let reason = '~~Unbanned due to softban duration~~ Already unbanned.';
	if (!filterTimeout) return;

	filterSoftbans.forEach(async (data) => {
		await data.delete();
		const bannedMember = await message.guild.bans?.fetch(data.userId).catch(() => {});
		const findUser = (await client.users
			.fetch(data.userId, { force: true })
			.catch(() => {})) as User;

		if (bannedMember || bannedMember !== undefined) {
			reason = 'Unbanned due to softban duration.';
			await message.guild.bans?.remove(data.userId);
		}

		await createModLog({
			action: PunishmentType.Unban,
			user: findUser,
			moderator: client.user,
			reason: reason,
			referencedPunishment: data,
		});

		await logsModel.findByIdAndDelete(data.case);
	});
});
