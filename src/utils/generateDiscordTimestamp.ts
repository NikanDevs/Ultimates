import { DiscordTimestampsNames, discordTimestampUnixs } from '../typings';

export function generateDiscordTimestamp(date: Date, type?: DiscordTimestampsNames) {
	type ? type : (type = 'Relative Time');
	return `<t:${Math.floor(date.getTime() / 1000)}:${discordTimestampUnixs[type]}>`;
}

