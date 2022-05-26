import { Guild, GuildMember, User } from 'discord.js';
import { client } from '..';
import { guild as guildConfig } from '../json/config.json';

export async function generateModmailInfoEmbed(user: User) {
	const guild =
		client.guilds.cache.get(guildConfig.id) ||
		((await client.guilds.fetch(guildConfig.id)) as Guild);
	const guildMember = (await guild.members.fetch(user.id)) as GuildMember;

	return client.util
		.embed()
		.setAuthor({
			name: user.tag,
			iconURL: user.displayAvatarURL(),
		})
		.setColor(client.cc.ultimates)
		.setDescription(`${user} • ID: ${user.id}`)
		.setThumbnail(user.displayAvatarURL())
		.addFields(
			{
				name: 'Account Information',
				value: [
					`• **Username:** ${user.tag}`,
					`• **ID:** ${user.id}`,
					`• **Registered:** <t:${~~(+user?.createdAt / 1000)}:f> | <t:${~~(
						+user?.createdAt / 1000
					)}:R>`,
				].join('\n'),
			},
			{
				name: 'Server Information',
				value: [
					`• **Joined**: <t:${~~(+guildMember.joinedAt / 1000)}:f> | <t:${~~(
						+guildMember.joinedAt / 1000
					)}:R>`,
					`• **Nickname**: ${
						user.username == guildMember.displayName
							? `No Nickname`
							: guildMember.displayName
					}`,
				].join('\n'),
			}
		);
}

