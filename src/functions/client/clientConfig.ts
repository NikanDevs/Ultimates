import { WebhookClient } from 'discord.js';
import { configModel } from '../../models/config';

export class clientConfig {
	/** Logging system webhook clients */
	webhooks = {
		mod: null as WebhookClient,
		message: null as WebhookClient,
		modmail: null as WebhookClient,
		servergate: null as WebhookClient,
	};

	/** Logging system active status */
	logging = {
		mod: null as boolean,
		message: null as boolean,
		modmail: null as boolean,
		servergate: null as boolean,
	};

	/** Automod data */
	automod = {
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
	general = {
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
	moderation = {
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
			reason: null as string,
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

	async updateLogs() {
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

		this.logging = {
			mod: data.logging.mod.active,
			modmail: data.logging.modmail.active,
			message: data.logging.message.active,
			servergate: data.logging.servergate.active,
		};
	}

	async updateAutomod() {
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

	async updateGeneral() {
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

	async updateModeration() {
		const data = await configModel.findById('moderation');
		if (!data) return;

		this.moderation = {
			count: {
				automod: data.count.automod,
				timeout1: data.count.timeout1,
				timeout2: data.count.timeout2,
				ban: data.count.timeout2,
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
				reason: data.default.reason,
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
}

