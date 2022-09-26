import { WebhookClient } from 'discord.js';
import { configModel } from '../models/config';

export class Config {
	/** Logging system status */
	public logging = {
		webhook: null as WebhookClient,
		mod: { channelId: null as string, active: null as boolean },
		message: { channelId: null as string, active: null as boolean },
		modmail: { channelId: null as string, active: null as boolean },
		servergate: { channelId: null as string, active: null as boolean },
		voice: { channelId: null as string, active: null as boolean },
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
		developers: [] as string[],
		appealLink: null as string,
		memberRoleId: null as string,
		modmailCategoryId: null as string,
		confirmation: null as boolean,
	};

	/** The config for the moderation system. */
	public moderation = {
		counts: { automod: null, timeout1: null, timeout2: null, ban: null },
		durations: {
			timeout1: null as number,
			timeout2: null as number,
			ban: null as number,
			automod: null as number,
		},
		defaults: {
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

		this.logging = {
			webhook: new WebhookClient({
				id: getWebhookInfo(data.logging.base.webhook)[0],
				token: getWebhookInfo(data.logging.base.webhook)[1],
			}),
			mod: { channelId: data.logging.mod.channelId, active: data.logging.mod.active },
			modmail: { channelId: data.logging.modmail.channelId, active: data.logging.modmail.active },
			message: { channelId: data.logging.message.channelId, active: data.logging.message.active },
			servergate: { channelId: data.logging.servergate.channelId, active: data.logging.servergate.active },
			voice: { channelId: data.logging.voice.channelId, active: data.logging.voice.active },
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
			developers: data.developers,
			appealLink: data.appealLink,
			memberRoleId: data.memberRoleId,
			modmailCategoryId: data.modmailCategoryId,
			confirmation: data.confirmation,
		};
	}

	public async updateModeration() {
		const data = await configModel.findById('moderation');
		if (!data) return;

		this.moderation = {
			counts: {
				automod: data.counts.automod,
				timeout1: data.counts.timeout1,
				timeout2: data.counts.timeout2,
				ban: data.counts.ban,
			},
			durations: {
				timeout1: data.durations.timeout1,
				timeout2: data.durations.timeout2,
				ban: data.durations.ban,
				automod: data.durations.automod,
			},
			defaults: {
				timeout: data.defaults.timeout,
				softban: data.defaults.softban,
				msgs: data.defaults.msgs,
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

	private async setSubstances() {
		const logging = await configModel.findById('logging');
		const automod = await configModel.findById('automod');
		const general = await configModel.findById('general');
		const moderation = await configModel.findById('moderation');
		const ignores = await configModel.findById('ignores');

		if (!logging)
			await new configModel({
				_id: 'logging',
				logging: {
					base: { channelId: null, webhook: null },
					mod: { channelId: null, active: true },
					modmail: { channelId: null, active: true },
					message: { channelId: null, active: true },
					servergate: { channelId: null, active: true },
					voice: { channelId: null, active: true },
				},
			}).save();

		if (!automod)
			await new configModel({
				_id: 'automod',
				filteredWords: [],
				modules: {
					badwords: false,
					invites: false,
					largeMessage: false,
					massMention: false,
					massEmoji: false,
					spam: false,
					capitals: false,
					urls: false,
				},
			}).save();

		if (!general)
			await new configModel({
				_id: 'general',
				developers: [],
				appealLink: null,
				memberRoleId: null,
				modmailCategoryId: null,
			}).save();

		if (!moderation)
			await new configModel({
				_id: 'moderation',
				counts: { automod: 3, timeout1: 2, timeout2: 4, ban: 6 },
				durations: {
					timeout1: 60 * 60 * 1000,
					timeout2: 2 * 60 * 60 * 1000,
					ban: null,
					automod: 60 * 30 * 1000,
				},
				defaults: {
					timeout: 60 * 60 * 1000,
					softban: 60 * 60 * 24 * 30 * 1000,
					msgs: 0,
				},
				reasons: {
					warn: [],
					timeout: [],
					ban: [],
					softban: [],
					unban: [],
					kick: [],
				},
			}).save();

		if (!ignores)
			await new configModel({
				_id: 'ignores',
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
			}).save();
	}

	public async setConfig() {
		await this.setSubstances();

		await this.updateLogs();
		await this.updateAutomod();
		await this.updateGeneral();
		await this.updateModeration();
		await this.updateIgnores();
	}
}
