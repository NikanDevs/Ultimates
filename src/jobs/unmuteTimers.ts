import type { GuildMember, User } from 'discord.js';
import { t } from 'i18next';
import { client } from '..';
import { createModLog } from '../functions/logs/createModLog';
import { durationsModel } from '../models/durations';
import { PunishmentTypes } from '../typings';

export const checkUnmutes = async () => {
	const guild = await client.guilds.fetch(process.env.GUILD_ID);
	const allData = await durationsModel.find({ type: PunishmentTypes.Timeout });
	const endedData = allData?.filter((c) => Date.now() > c.expires.getTime());
	if (!endedData) return;

	for (const data of endedData) {
		await data.delete();
		const guildMember = (await guild.members?.fetch(data.userId).catch(() => {})) as GuildMember;
		const findUser = (await client.users.fetch(data.userId, { force: true }).catch(() => {})) as User;

		if (guildMember) guildMember.timeout(null, t('job.unmute.ended'));

		await createModLog({
			action: PunishmentTypes.Unmute,
			user: findUser,
			moderator: client.user,
			reason: t('job.unmute.ended'),
			referencedPunishment: data,
		});
	}
};
