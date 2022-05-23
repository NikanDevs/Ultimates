import { Colors, InteractionReplyOptions, User, Util } from 'discord.js';
import { emojis } from '../../json/database.json';
import { client } from '../..';
import { guildId } from '../../json/config.json';
import { PunishmentType } from '../../typings/PunishmentType';

export const clientColors = {
	error: Colors.Red,
	success: Colors.Green,
	ultimates: Util.resolveColor('#fcc603'),
	wait: Colors.Yellow,
	invisible: Util.resolveColor('#2F3136'),
	moderation: Util.resolveColor('#dbca95'),
};

export const clientServer = {
	id: guildId,
	dev: '869805946854068281',
	invite: `https://discord.gg/4HX9RneUjt`,
	appeal: 'https://forms.gle/dW8RGLA65ycC4vcM7',
	verificationChannel: '912572618308210708',
};

export const databaseConfig = {
	logsActive: {
		mod: null,
		message: null,
		modmail: null,
		servergate: null,
	},
};

export const clientCc = {
	cannotInteract: {
		content: "You can't use this!",
		ephemeral: true,
	} as InteractionReplyOptions,
	success: emojis.sucess,
	error: emojis.error,
	attention: emojis.attention,
	previous: '◀️',
	next: '▶️',
};

export const clientEmbeds = {
	error: function name(error: string) {
		const embed = client.util
			.embed()
			.setDescription(clientCc.error + ' ' + error)
			.setColor(Util.resolveColor('Red'));
		return embed;
	},
	attention: function (message: string) {
		const embed = client.util
			.embed()
			.setDescription(clientCc.attention + ' ' + message)
			.setColor(Util.resolveColor('#f0e17c'));
		return embed;
	},
	success: function (message: string) {
		const embed = client.util
			.embed()
			.setDescription(clientCc.success + ' ' + message)
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
		const embed = client.util
			.embed()
			.setDescription(
				`${user} was **${pastForm[options['action']]}**  • ID: \`${options['id']}\``
			)
			.setColor(client.colors.moderation);
		return embed;
	},
};
