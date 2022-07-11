import { WebhookClient } from 'discord.js';
import { configModel } from '../models/config';

export class Config {
	/** Logging system webhook clients */
	public webhooks = {
		mod: null as WebhookClient,
		message: null as WebhookClient,
		modmail: null as WebhookClient,
		servergate: null as WebhookClient,
		voice: null as WebhookClient,
	};

	/** Logging system active status */
	public logging = {
		mod: null as boolean,
		message: null as boolean,
		modmail: null as boolean,
		servergate: null as boolean,
		voice: null as boolean,
	};

	/** Automod data */
	public automod = {
		/** Automod activity status */
		modules: {
			badwords: null as boolean,
			invites: null as boolean,
			largeMessage: null as boolean,
			massMention: null as boolean,
			massEmoji: null as boolean,
			spam: null as boolean,
			capitals: null as boolean,
			urls: null as boolean,
		},
		/** Automod Array of filtered words */
		filteredWords: [] as string[],
	};

	/** General data */
	public general = {
		ownerId: null as string,
		developers: [] as string[],
		success: '' as string,
		error: '' as string,
		attention: '' as string,
		guild: {
			appealLink: null as string,
			memberRoleId: null as string,
			modmailCategoryId: null as string,
		},
	};

	/** The config for the moderation system. */
	public moderation = {
		count: { automod: null, timeout1: null, timeout2: null, ban: null },
		duration: {
			timeout1: null as number,
			timeout2: null as number,
			ban: null as number,
			automod: null as number,
		},
		default: {
			timeout: null as number,
			softban: null as number,
			msgs: null as number,
		},
		reasons: {
			warn: [] as string[],
			timeout: [] as string[],
			ban: [] as string[],
			softban: [] as string[],
			unban: [] as string[],
			kick: [] as string[],
		},
	};

	/** The config for the ignore list for modules */
	public ignores = {
		automod: {
			badwords: { channelIds: [], roleIds: [] },
			invites: { channelIds: [], roleIds: [] },
			largeMessage: { channelIds: [], roleIds: [] },
			massMention: { channelIds: [], roleIds: [] },
			massEmoji: { channelIds: [], roleIds: [] },
			spam: { channelIds: [], roleIds: [] },
			capitals: { channelIds: [], roleIds: [] },
			urls: { channelIds: [], roleIds: [] },
		},
		logs: {
			message: {
				channelIds: [],
				roleIds: [],
			},
			voice: {
				channelIds: [],
				roleIds: [],
			},
		},
	};

	public async updateLogs() {
		const data = await configModel.findById('logging');
		if (!data) return;

		function getWebhookInfo(url: string) {
			if (!url) return [undefined];

			const filtered = url.replaceAll('https://discord.com/api/webhooks/', '');
			const returns: string[] = [];
			returns.push(filtered.split('/')[0]);
			returns.push(filtered.split('/')[1]);

			return returns;
		}

		this.webhooks.mod = new WebhookClient({
			id: getWebhookInfo(data.logging.mod.webhook)[0],
			token: getWebhookInfo(data.logging.mod.webhook)[1],
		});
		this.webhooks.message = new WebhookClient({
			id: getWebhookInfo(data.logging.message.webhook)[0],
			token: getWebhookInfo(data.logging.message.webhook)[1],
		});
		this.webhooks.modmail = new WebhookClient({
			id: getWebhookInfo(data.logging.modmail.webhook)[0],
			token: getWebhookInfo(data.logging.modmail.webhook)[1],
		});
		this.webhooks.servergate = new WebhookClient({
			id: getWebhookInfo(data.logging.servergate.webhook)[0],
			token: getWebhookInfo(data.logging.servergate.webhook)[1],
		});
		this.webhooks.voice = new WebhookClient({
			id: getWebhookInfo(data.logging.voice.webhook)[0],
			token: getWebhookInfo(data.logging.voice.webhook)[1],
		});

		this.logging = {
			mod: data.logging.mod.active,
			modmail: data.logging.modmail.active,
			message: data.logging.message.active,
			servergate: data.logging.servergate.active,
			voice: data.logging.voice.active,
		};
	}

	public async updateAutomod() {
		const data = await configModel.findById('automod');
		if (!data) return;

		this.automod.modules = {
			badwords: data.modules.badwords,
			invites: data.modules.invites,
			largeMessage: data.modules.largeMessage,
			massMention: data.modules.massMention,
			massEmoji: data.modules.massEmoji,
			spam: data.modules.spam,
			capitals: data.modules.capitals,
			urls: data.modules.urls,
		};

		this.automod.filteredWords = data.filteredWords;
	}

	public async updateGeneral() {
		const data = await configModel.findById('general');
		if (!data) return;

		this.general = {
			ownerId: data.ownerId,
			developers: data.developers,
			success: data.success,
			error: data.error,
			attention: data.attention,
			guild: {
				appealLink: data.guild.appealLink,
				memberRoleId: data.guild.memberRoleId,
				modmailCategoryId: data.guild.modmailCategoryId,
			},
		};
	}

	public async updateModeration() {
		const data = await configModel.findById('moderation');
		if (!data) return;

		this.moderation = {
			count: {
				automod: data.count.automod,
				timeout1: data.count.timeout1,
				timeout2: data.count.timeout2,
				ban: data.count.ban,
			},
			duration: {
				timeout1: data.duration.timeout1,
				timeout2: data.duration.timeout2,
				ban: data.duration.ban,
				automod: data.duration.automod,
			},
			default: {
				timeout: data.default.timeout,
				softban: data.default.softban,
				msgs: data.default.msgs,
			},
			reasons: {
				warn: data.reasons.warn,
				timeout: data.reasons.timeout,
				ban: data.reasons.ban,
				softban: data.reasons.softban,
				unban: data.reasons.unban,
				kick: data.reasons.kick,
			},
		};
	}

	public async updateIgnores() {
		const data = await configModel.findById('ignores');
		if (!data) return;

		this.ignores = {
			automod: {
				badwords: {
					channelIds: data.automod.badwords.channelIds,
					roleIds: data.automod.badwords.roleIds,
				},
				invites: {
					channelIds: data.automod.invites.channelIds,
					roleIds: data.automod.invites.roleIds,
				},
				largeMessage: {
					channelIds: data.automod.largeMessage.channelIds,
					roleIds: data.automod.largeMessage.roleIds,
				},
				massMention: {
					channelIds: data.automod.massMention.channelIds,
					roleIds: data.automod.massMention.roleIds,
				},
				massEmoji: {
					channelIds: data.automod.massEmoji.channelIds,
					roleIds: data.automod.massEmoji.roleIds,
				},
				spam: {
					channelIds: data.automod.spam.channelIds,
					roleIds: data.automod.spam.roleIds,
				},
				capitals: {
					channelIds: data.automod.capitals.channelIds,
					roleIds: data.automod.capitals.roleIds,
				},
				urls: {
					channelIds: data.automod.urls.channelIds,
					roleIds: data.automod.urls.roleIds,
				},
			},
			logs: {
				message: {
					channelIds: data.logs.message.channelIds,
					roleIds: data.logs.message.roleIds,
				},
				voice: {
					channelIds: data.logs.voice.channelIds,
					roleIds: data.logs.voice.roleIds,
				},
			},
		};
	}

	public async setConfig() {
		await this.updateLogs();
		await this.updateAutomod();
		await this.updateGeneral();
		await this.updateModeration();
		await this.updateIgnores();
	}
}

