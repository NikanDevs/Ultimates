import { Formatters, type User } from 'discord.js';
import { client } from '..';
import { createModLog } from '../functions/logs/createModLog';
import { durationsModel } from '../models/durations';
import { PunishmentTypes } from '../typings';

export const checkUnbans = async () => {
	const guild = await client.guilds.fetch(process.env.GUILD_ID);
	const allData = await durationsModel.find({ type: PunishmentTypes.Softban });
	const endedData = allData?.filter((c) => Date.now() > c.expires.getTime());
	let reason =
		Formatters.strikethrough('Unbanned due to softban duration') + ' Already unbanned.';
	if (!endedData) return;

	for (const data of endedData) {
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
	}
};

