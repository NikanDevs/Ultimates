import { GuildMember } from 'discord.js';
import { getModCase } from '../functions/cases/modCase';
import { durationsModel } from '../models/durations';
import { PunishmentType } from '../typings/PunishmentType';

export async function timeoutMember(
	member: GuildMember,
	options: {
		reason: string;
		duration: number;
	}
) {
	await member.timeout(options['duration'], options['reason']);

	const data = new durationsModel({
		case: await getModCase(),
		type: PunishmentType.Timeout,
		userId: member.user.id,
		date: new Date(),
		duration: options.duration,
	});
	await data.save();
}
