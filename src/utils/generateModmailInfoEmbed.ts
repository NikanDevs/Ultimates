import { EmbedBuilder, GuildMember, User } from 'discord.js';
import { t } from 'i18next';
import { client } from '..';
import { generateDiscordTimestamp } from './generateDiscordTimestamp';

export async function generateModmailInfoEmbed(user: User) {
	const guild = client.guilds.cache.get(process.env.GUILD_ID);
	const member = (await guild.members.fetch(user.id)) as GuildMember;

	return new EmbedBuilder()
		.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
		.setColor(client.cc.ultimates)
		.setDescription(t('event.modmail.embed.description', { id: user.id, user: user.toString() }))
		.setThumbnail(user.displayAvatarURL())
		.addFields([
			{
				name: t('event.modmail.embed.account'),
				value: [
					t('event.modmail.embed.username', { username: user.username }),
					t('event.modmail.embed.id', { id: user.id }),
					t('event.modmail.embed.registered', { date: generateDiscordTimestamp(user.createdAt) }),
				].join('\n'),
			},
			{
				name: t('event.modmail.embed.guild'),
				value: [
					t('event.modmail.embed.joined', { date: generateDiscordTimestamp(member.joinedAt) }),
					t('event.modmail.embed.nickname', {
						nickname: user.username == member.displayName ? client.cc.error : member.displayName,
					}),
				].join('\n'),
			},
		]);
}
