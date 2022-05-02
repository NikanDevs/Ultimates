import { GuildMember } from 'discord.js';
import { getModCase } from '../functions/cases/modCase';
import { timeoutsModel } from '../models/timeouts';

export async function timeoutMember(
	member: GuildMember,
	options: {
		reason: string;
		duration: number;
	}
) {
	await member.timeout(options['duration'], options['reason']);

	const data = new timeoutsModel({
		case: await getModCase(),
		userId: member.user.id,
		unmuteAt: Date.now() + options['duration'],
	});
	await data.save();
}
