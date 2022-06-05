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

	async updateLogs() {
		const data = await configModel.findById('logs');
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
			id: getWebhookInfo(data.mod.webhook)[0],
			token: getWebhookInfo(data.mod.webhook)[1],
		});
		this.webhooks.message = new WebhookClient({
			id: getWebhookInfo(data.message.webhook)[0],
			token: getWebhookInfo(data.message.webhook)[1],
		});
		this.webhooks.modmail = new WebhookClient({
			id: getWebhookInfo(data.modmail.webhook)[0],
			token: getWebhookInfo(data.modmail.webhook)[1],
		});
		this.webhooks.servergate = new WebhookClient({
			id: getWebhookInfo(data.servergate.webhook)[0],
			token: getWebhookInfo(data.servergate.webhook)[1],
		});

		this.logging = {
			mod: data.mod.active,
			modmail: data.modmail.active,
			message: data.message.active,
			servergate: data.servergate.active,
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
}
