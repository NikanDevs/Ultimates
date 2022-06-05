import { Colors, EmbedBuilder, User, Util } from 'discord.js';
import { emojis } from '../../json/database.json';
import { client } from '../..';
import { PunishmentType } from '../../typings/PunishmentType';

export const cc = {
	errorC: Colors.Red,
	successC: Colors.Green,
	ultimates: Util.resolveColor('#fcc603'),
	attentionC: Colors.Yellow,
	invisible: Util.resolveColor('#2F3136'),
	moderation: Util.resolveColor('#dbca95'),
	successE: emojis.sucess,
	errorE: emojis.error,
	attentionE: emojis.attention,
	previous: '◀️',
	next: '▶️',
};

export const clientEmbeds = {
	error: function name(error: string) {
		const embed = new EmbedBuilder()
			.setDescription(cc.errorE + ' ' + error)
			.setColor(Util.resolveColor('Red'));
		return embed;
	},
	attention: function (message: string) {
		const embed = new EmbedBuilder()
			.setDescription(cc.attentionE + ' ' + message)
			.setColor(Util.resolveColor('#f0e17c'));
		return embed;
	},
	success: function (message: string) {
		const embed = new EmbedBuilder()
			.setDescription(cc.successE + ' ' + message)
			.setColor(Util.resolveColor('#9eea9a'));
		return embed;
	},
	moderation: function (user: User | string, options: { action: PunishmentType; id: string }) {
		enum pastForm {
			'WARN' = 'warned',
			'BAN' = 'banned',
			'KICK' = 'kicked',
			'TIMEOUT' = 'timed out',
			'UNBAN' = 'unbanned',
			'SOFTBAN' = 'soft banned',
		}
		const embed = new EmbedBuilder()
			.setDescription(
				`${user} was **${pastForm[options['action']]}**  • ID: \`${options['id']}\``
			)
			.setColor(client.cc.moderation);
		return embed;
	},
};
