import { GuildMember, Message } from 'discord.js';
import { client } from '../..';
import { AUTOMOD_MAX_MENTIONS, AUTOMOD_MAX_MESSAGE_LENGTH } from '../../constants';
import { isDiscordInvite } from '../../functions/automod/isDiscordInvite';
import { isURL } from '../../functions/automod/isURL';
import { mostIsCap } from '../../functions/automod/mostIsCaps';
import { mostIsEmojis } from '../../functions/automod/mostIsEmojis';
import { Event } from '../../structures/Event';

export default new Event('messageUpdate', async (_oldMessage, newMessage) => {
	const member = newMessage.member as GuildMember;

	// Main Reqs
	if (
		!newMessage.guild ||
		newMessage.guildId !== process.env.GUILD_ID ||
		newMessage.author.bot ||
		!newMessage.content ||
		member.permissions?.has('Administrator')
	)
		return;

	if (
		newMessage.content.length > AUTOMOD_MAX_MESSAGE_LENGTH ||
		isDiscordInvite(newMessage.content) ||
		isURL(newMessage.content) ||
		newMessage.mentions?.members.size > AUTOMOD_MAX_MENTIONS ||
		mostIsCap(newMessage.content) ||
		mostIsEmojis(newMessage.content) ||
		client.config.automod.filteredWords.some((word) => newMessage.content.toUpperCase().includes(word))
	)
		client.emit('messageCreate', newMessage as Message);
});
