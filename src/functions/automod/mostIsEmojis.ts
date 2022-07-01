import { Util } from "discord.js";
import { AUTOMOD_MAX_EMOJI_COUNT } from "../../constants";

export function mostIsEmojis(str: string) {
	const countEmojis = [];
	for (const rawStr of str.trim().split(/ +/g)) {
		const parseEmoji = Util.parseEmoji(rawStr);
		if (parseEmoji?.id) countEmojis.push(rawStr);
	}
	if (countEmojis.length > AUTOMOD_MAX_EMOJI_COUNT) {
		return true;
	} else {
		return false;
	}
}
