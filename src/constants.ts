import { Collection } from 'discord.js';
import { GuardCollectionTypes, ModmailCollectionTypes } from './typings';

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
export const verificationCollection = new Collection<string, string | number>();
export const automodSpamCollection = new Collection<string, number>();
export const guardCollection = new Collection<GuardCollectionTypes, null | string[]>();
export const modmailCollection = new Collection<ModmailCollectionTypes, number | null>();

// Other constants
export const EMBED_DESCRIPTION_MAX_LENGTH = 4096;
export const PUNISHMENT_ID_LENGTH = 18;
export const AUTOMOD_ID_LENGTH = 6;
export const AUTOMOD_SPAM_COUNT = 5;
export const AUTOMOD_MAX_EMOJI_COUNT = 10;
export const AUTOMOD_MAX_CAPS = 90; /** % **/
export const AUTOMOD_MAX_MESSAGE_LENGTH = 550;
export const AUTOMOD_MAX_MENTIONS = 4;
export const MIN_SOFTBAN_DURATION = 60000; // 1 minute
export const MAX_SOFTBAN_DURATION = 1000 * 60 * 60 * 24 * 365; // 1 year
export const MIN_TIMEOUT_DURATION = 10000; // 10 seconds
export const MAX_TIMEOUT_DURATION = 1000 * 60 * 60 * 24 * 27; // 27 days
export const MIN_ANTIRAID_DURATION = 1000 * 60; // 1 minute
export const MAX_ANTIRAID_DURATION = 1000 * 60 * 60 * 24 * 180; // 180 days
export const MAX_REASON_LENGTH = 100;
export const MAX_FIELD_VALUE_LENGTH = 1024;
export const MAX_AUTOCOMPLETE_LENGTH = 100;
export const VERIFICATION_TIME = 30 * 1000;
