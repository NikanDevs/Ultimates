import { GuildMember } from 'discord.js';
import { Command } from '../../structures/Command';
import { ignore } from '../../functions/ignore';
import { interactions } from '../../interactions';
import { PunishmentType } from '../../typings/PunishmentType';

export default new Command({
	interaction: interactions.nickname,
	excute: async ({ client, interaction, options }) => {
		const member = options.getMember('member') as GuildMember;
		const newNick = options.getString('nickname');
		let auditLogReason = '/nickname was excuted by a moderator.';

		if (ignore(member, { interaction, action: PunishmentType.Unknown })) return;
		if (!member)
			return interaction.reply({
				embeds: [client.embeds.error('I could not find that member in this server.')],
				ephemeral: true,
			});

		if (newNick) {
			// Set a new nickname
			if (newNick.length > 32)
				return interaction.reply({
					embeds: [
						client.embeds.error('The nickname must be 32 or fewer in length.'),
					],
					ephemeral: true,
				});

			member.setNickname(newNick, auditLogReason);
			interaction.reply({
				embeds: [
					client.embeds.success(
						`**${member.user.tag}** nickname was set to **${newNick}**`
					),
				],
			});
		} else if (!newNick && !member.nickname) {
			// Moderate the nickname
			function generateNick() {
				const characters =
					'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
				let nickname = '';
				for (var i = 0; i < 5; i++) {
					nickname += characters.charAt(
						Math.floor(Math.random() * characters.length)
					);
				}
				return nickname;
			}

			member.setNickname(`Moderated Nickname ` + generateNick(), auditLogReason);
			interaction.reply({
				embeds: [
					client.embeds.success(`**${member.user.tag}** nickname was moderated.`),
				],
			});
		} else if (!newNick && member.nickname) {
			// Reset the nickname
			member.setNickname(null, auditLogReason);
			interaction.reply({
				embeds: [client.embeds.success(`**${member.user.tag}** nickname was reset.`)],
			});
		}
	},
});
