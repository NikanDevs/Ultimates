import { Colors, EmbedBuilder, Formatters, resolveColor, User } from 'discord.js';
import { client } from '../..';
import {
	type emojisConfigTypes,
	punishmentTypeNames,
	type EmojisConfigTypes,
	emojisConfigDefaults,
} from '../../typings';
import { PunishmentTypes } from '../../typings';
import { load } from 'js-yaml';
import { existsSync, readFileSync } from 'node:fs';

export const cc = {
	ultimates: resolveColor('#fcc603'),
	invisible: resolveColor('#2F3136'),
	moderation: resolveColor('#dbca95'),
	success: checkEmojis('success'),
	error: checkEmojis('error'),
	attention: checkEmojis('attention'),
	ping: {
		ping: checkEmojis('ping'),
		mongoDB: checkEmojis('mongoDB'),
	},
	statuses: {
		online: checkEmojis('online'),
		idle: checkEmojis('idle'),
		dnd: checkEmojis('dnd'),
		offline: checkEmojis('offline'),
	},
};

export const clientEmbeds = {
	success: function (message: string) {
		const embed = new EmbedBuilder()
			.setDescription(client.cc.success + ' • ' + message)
			.setColor(resolveColor('#9eea9a'));
		return embed;
	},
	attention: function (message: string) {
		const embed = new EmbedBuilder()
			.setDescription(client.cc.attention + ' • ' + message)
			.setColor(resolveColor('#f0e17c'));
		return embed;
	},
	error: function name(error: string) {
		const embed = new EmbedBuilder().setDescription(client.cc.error + ' • ' + error).setColor(Colors.Red);
		return embed;
	},
	moderation: function (user: User | string, options: { action: PunishmentTypes; id: string }) {
		const embed = new EmbedBuilder()
			.setDescription(
				`${Formatters.bold(user.toString())} was ${punishmentTypeNames[options.action]}  • ID: \`${
					options['id']
				}\``
			)
			.setColor(client.cc.moderation);
		return embed;
	},
};

function checkEmojis(type: EmojisConfigTypes) {
	const emojisExist: boolean = existsSync(`${process.cwd()}/emojis.yml`);

	const output = emojisExist
		? !readFileSync(`${process.cwd()}/emojis.yml`, 'utf8').trim().length
			? emojisConfigDefaults[type]
			: (load(readFileSync(`${process.cwd()}/emojis.yml`, 'utf8')) as emojisConfigTypes)[type] === undefined
			? emojisConfigDefaults[type]
			: (load(readFileSync(`${process.cwd()}/emojis.yml`, 'utf8')) as emojisConfigTypes)[type]
		: emojisConfigDefaults[type];

	return output;
}
