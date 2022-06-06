import { Colors, EmbedBuilder, User, Util } from 'discord.js';
import { client } from '../..';
import { PunishmentType } from '../../typings/PunishmentType';

export const cc = {
	errorC: Colors.Red,
	successC: Colors.Green,
	ultimates: Util.resolveColor('#fcc603'),
	attentionC: Colors.Yellow,
	invisible: Util.resolveColor('#2F3136'),
	moderation: Util.resolveColor('#dbca95'),
	previous: '◀️',
	next: '▶️',
};

export const clientEmbeds = {
	success: function (message: string) {
		const embed = new EmbedBuilder()
			.setDescription(client.config.general.success + ' ' + message)
			.setColor(Util.resolveColor('#9eea9a'));
		return embed;
	},
	attention: function (message: string) {
		const embed = new EmbedBuilder()
			.setDescription(client.config.general.attention + ' ' + message)
			.setColor(Util.resolveColor('#f0e17c'));
		return embed;
	},
	error: function name(error: string) {
		const embed = new EmbedBuilder()
			.setDescription(client.config.general.error + ' ' + error)
			.setColor(Util.resolveColor('Red'));
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
