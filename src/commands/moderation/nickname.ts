import { GuildMember } from 'discord.js';
import { Command } from '../../structures/Command';
import { ignore } from '../../functions/ignore';
import { interactions } from '../../interactions';
import { PunishmentTypes } from '../../typings';
import { t } from 'i18next';

export default new Command({
	interaction: interactions.nickname,
	excute: async ({ client, interaction, options }) => {
		const member = options.getMember('member') as GuildMember;
		const newNick = options.getString('nickname');

		if (ignore(member, { interaction, action: PunishmentTypes.Unknown })) return;
		if (!member)
			return interaction.reply({
				embeds: [client.embeds.error(t('common.errors.invalidMember'))],
				ephemeral: true,
			});

		if (newNick) {
			// Set a new nickname
			member.setNickname(newNick);
			interaction.reply({
				embeds: [
					client.embeds.success(
						t('command.mod.nickname.set', { member: member.user.tag, nick: newNick })
					),
				],
				ephemeral: true,
			});
		} else if (!newNick && !member.nickname) {
			// Moderate the nickname
			function generateNick() {
				const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
				let nickname = '';
				for (var i = 0; i < 5; i++) {
					nickname += characters.charAt(Math.floor(Math.random() * characters.length));
				}
				return nickname;
			}

			member.setNickname(`Moderated Nickname ` + generateNick(), `/nickname by ${interaction.user.tag}`);
			interaction.reply({
				embeds: [client.embeds.success(t('command.mod.nickname.moderate', { member: member.user.tag }))],
				ephemeral: true,
			});
		} else if (!newNick && member.nickname) {
			// Reset the nickname
			member.setNickname(null, `/nickname by ${interaction.user.tag}`);
			interaction.reply({
				embeds: [client.embeds.success(t('command.mod.nickname.reset', { member: member.user.tag }))],
				ephemeral: true,
			});
		}
	},
});
