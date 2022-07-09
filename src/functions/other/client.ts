import { Colors, EmbedBuilder, Formatters, resolveColor, User } from 'discord.js';
import { client } from '../..';
import { punishmentTypeNames } from '../../typings';
import { PunishmentTypes } from '../../typings';

export const cc = {
	errorC: Colors.Red,
	successC: Colors.Green,
	ultimates: resolveColor('#fcc603'),
	attentionC: Colors.Yellow,
	invisible: resolveColor('#2F3136'),
	moderation: resolveColor('#dbca95'),
	previous: '◀️',
	next: '▶️',
};

export const clientEmbeds = {
	success: function (message: string) {
		const embed = new EmbedBuilder()
			.setDescription(client.config.general.success + ' ' + message)
			.setColor(resolveColor('#9eea9a'));
		return embed;
	},
	attention: function (message: string) {
		const embed = new EmbedBuilder()
			.setDescription(client.config.general.attention + ' ' + message)
			.setColor(resolveColor('#f0e17c'));
		return embed;
	},
	error: function name(error: string) {
		const embed = new EmbedBuilder()
			.setDescription(client.config.general.error + ' ' + error)
			.setColor(resolveColor('Red'));
		return embed;
	},
	moderation: function (user: User | string, options: { action: PunishmentTypes; id: string }) {
		const embed = new EmbedBuilder()
			.setDescription(
				`${Formatters.bold(user.toString())} was ${
					punishmentTypeNames[options.action]
				}  • ID: \`${options['id']}\``
			)
			.setColor(client.cc.moderation);
		return embed;
	},
};
