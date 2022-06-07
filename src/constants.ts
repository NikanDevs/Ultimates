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
export const PUNISHMENT_ID_LENGTH = 18;
export const AUTOMOD_ID_LENGTH = 6;
export const AUTOMOD_SPAM_COUNT = 5;
export const AUTOMOD_MAX_EMOJI_COUNT = 10;
export const AUTOMOD_MAX_CAPS = 90; /** % **/
export const MIN_SOFTBAN_DURATION = 60000; // 1 minute
export const MAX_SOFTBAN_DURATION = 1000 * 60 * 60 * 24 * 365; // 1 year
export const MIN_TIMEOUT_DURATION = 10000; // 10 seconds
export const MAX_TIMEOUT_DURATION = 1000 * 60 * 60 * 24 * 27; // 27 days
export enum WEBHOOK_NAMES {
	'mod' = 'Mod-Logs',
	'message' = 'Message-Logs',
	'modmail' = 'Modmail-Logs',
	'servergate' = 'Server Gate',
	'error' = 'Errors',
}
