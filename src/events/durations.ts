import { Formatters, GuildMember, User } from 'discord.js';
import { Event } from '../structures/Event';
import { client } from '..';
import { createModLog } from '../functions/logs/createModLog';
import { durationsModel } from '../models/durations';
import { PunishmentTypes } from '../typings';

export default new Event('ready', () => {
	setInterval(async () => {
		const guild = await client.guilds.fetch(process.env.GUILD_ID);
		// Unmutes
		const findTimeouts = await durationsModel.find({ type: PunishmentTypes.Timeout });
		const filterTimeout = findTimeouts?.filter(
			(c) => Date.now() > (c?.date as Date)?.getTime() + c.duration
		);
		if (!filterTimeout) return;

		filterTimeout.forEach(async (data) => {
			await data.delete();
			const guildMember = (await guild.members
				?.fetch(data.userId)
				.catch(() => {})) as GuildMember;
			const findUser = (await client.users
				.fetch(data.userId, { force: true })
				.catch(() => {})) as User;

			if (guildMember) guildMember.timeout(null, 'Timeout ended based on the duration.');

			await createModLog({
				action: PunishmentTypes.Unmute,
				user: findUser,
				moderator: client.user,
				reason: 'Timeout ended based on the duration.',
				referencedPunishment: data,
			});
		});

		// Unbans
		const findSoftbans = await durationsModel.find({ type: PunishmentTypes.Softban });
		const filterSoftbans = findSoftbans?.filter(
			(c) => Date.now() > (c.date as Date).getTime() + c.duration
		);
		let reason =
			Formatters.strikethrough('Unbanned due to softban duration') + ' Already unbanned.';
		if (!filterTimeout) return;

		filterSoftbans.forEach(async (data) => {
			await data.delete();
			const bannedMember = await guild.bans?.fetch(data.userId).catch(() => {});
			const findUser = (await client.users
				.fetch(data.userId, { force: true })
				.catch(() => {})) as User;

			if (bannedMember || bannedMember !== undefined) {
				reason = 'Unbanned due to softban duration.';
				await guild.bans?.remove(data.userId);
			}

			await createModLog({
				action: PunishmentTypes.Unban,
				user: findUser,
				moderator: client.user,
				reason: reason,
				referencedPunishment: data,
			});
		});
	}, 30000);
});
