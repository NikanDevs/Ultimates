import { GuildMember } from 'discord.js';
import { getModCase } from '../functions/cases/modCase';
import { durationsModel } from '../models/durations';
import { PunishmentTypes } from '../typings';

export async function timeoutMember(
	member: GuildMember,
	options: {
		reason: string;
		duration: number;
	}
) {
	if (!member.communicationDisabledUntilTimestamp) await member.timeout(options.duration, options.reason);

	const data = new durationsModel({
		case: await getModCase(),
		type: PunishmentTypes.Timeout,
		userId: member.user.id,
		expires: new Date(Date.now() + options.duration),
	});
	await data.save();
}
