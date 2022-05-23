import { Collection } from 'discord.js';

// DB expiry calculations.

// 14 days - left member roles data
export const leftMemberExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);

// 1 day - automod punishments
export const automodPunishmentExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 1);

// 30 days - warnings
export const warningExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

// 3 months - All punishments
export const punishmentExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 90);

// Collections
export const verificationCollection: Collection<string, string | number> = new Collection();
export const automodSpamCollection: Collection<string, number> = new Collection();

// Other constants
export const EMBED_DESCRIPTION_MAX_LENGTH = 4096;
export enum WEBHOOK_NAMES {
	'mod' = 'Mod-Logs',
	'message' = 'Message-Logs',
	'modmail' = 'Modmail-Logs',
	'servergate' = 'Server Gate',
	'error' = 'Errors',
}
