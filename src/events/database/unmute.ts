import { GuildMember, User } from 'discord.js';
import { client } from '../..';
import { createModLog } from '../../functions/logs/createModLog';
import { timeoutsModel } from '../../models/timeouts';
import { Event } from '../../structures/Event';
import { PunishmentType } from '../../typings/PunishmentType';

export default new Event('messageCreate', async (message) => {
	const findData = await timeoutsModel.find();
	const filteredData = findData?.filter((c) => Date.now() > c.unmuteAt);

	if (!filteredData) return;

	filteredData.forEach(async (data) => {
		await data.delete();
		const guildMember = (await message.guild.members?.fetch(data.userId)) as GuildMember;
		const findUser = (await client.users
			.fetch(data.userId, { force: true })
			.catch(() => {})) as User;

		if (guildMember) guildMember.timeout(null, 'Mute ended based on the duration.');

		await createModLog({
			action: PunishmentType.Unmute,
			user: findUser,
			moderator: client.user,
			reason: 'Timeout ended based on the duration.',
			referencedPunishment: data,
		});
	});
});
