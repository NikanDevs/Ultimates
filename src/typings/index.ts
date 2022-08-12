import type {
	User,
	Snowflake,
	TextChannel,
	CommandInteraction,
	CommandInteractionOptionResolver,
	PermissionResolvable,
	ChatInputApplicationCommandData,
	EmbedBuilder,
	UserContextMenuCommandInteraction,
	ModalSubmitInteraction,
} from 'discord.js';
import type { UltimatesClient } from '../structures/Client';

// Command Interaction

export interface excuteOptions {
	client?: UltimatesClient;
	interaction?: CommandInteraction;
	options?: CommandInteractionOptionResolver;
}

type excuteFunction = (options: excuteOptions) => any;

type commandDirectories = 'moderation' | 'developer' | 'utility' | 'modmail';

export type interactionOptions = {
	name: string;
	description: string;
	directory: commandDirectories;
	cooldown?: number;
	permission?: PermissionResolvable[];
	botPermission?: PermissionResolvable[];
} & ChatInputApplicationCommandData;

export type commandType = {
	interaction: interactionOptions;
	excute: excuteFunction;
};

// Auto moderation typings

export type AutomodModules =
	| 'badwords'
	| 'invites'
	| 'massMention'
	| 'massEmoji'
	| 'largeMessage'
	| 'spam'
	| 'capitals'
	| 'urls';

// Logging system and modules typings

export type LoggingModules = 'mod' | 'message' | 'modmail' | 'servergate' | 'voice';

export const supportedLoggingIgnores: LoggingModules[] = ['message', 'voice'];

export enum loggingWebhookNames {
	'mod' = 'Mod-Logs',
	'message' = 'Message-Logs',
	'modmail' = 'Modmail-Logs',
	'servergate' = 'Server-Gate',
	'voice' = 'Voice-Logs',
}

// Logger

export interface LoggerClientOptions {
	timezone: string;
}

export interface LoggerDataOptions {
	source?: 'unhandledRejection' | 'uncaughtException' | 'warning' | any;
	reason?: Error;
	showDate?: boolean;
	space?: boolean;
}

// Discord chat timestamps

export type DiscordTimestampsNames =
	| 'Short Time'
	| 'Long Time'
	| 'Short Date'
	| 'Long Date'
	| 'Short Date/Time'
	| 'Long Date/Time'
	| 'Relative Time';

export enum discordTimestampUnixs {
	'Short Time' = 't',
	'Long Time' = 'T',
	'Short Date' = 'd',
	'Long Date' = 'D',
	'Short Date/Time' = 'f',
	'Long Date/Time' = 'F',
	'Relative Time' = 'R',
}

// Punishments and moderation

export enum PunishmentTypes {
	Warn = 'WARN',
	Kick = 'KICK',
	Ban = 'BAN',
	Timeout = 'TIMEOUT',
	Unmute = 'UNMUTE',
	Unban = 'UNBAN',
	Softban = 'SOFTBAN',
	Unknown = 'UNKNOWN',
}

export enum punishmentTypeNames {
	'WARN' = 'warned',
	'BAN' = 'banned',
	'KICK' = 'kicked',
	'TIMEOUT' = 'timed out',
	'UNBAN' = 'unbanned',
	'SOFTBAN' = 'soft banned',
}

export enum punishmentTypeEmbedColors {
	'WARN' = '#d4c03f',
	'TIMEOUT' = '#f5a742',
	'BAN' = '#cc423d',
	'KICK' = '#db644f',
	'UNMUTE' = '#2F3136',
	'UNBAN' = '#68b7bd',
	'SOFTBAN' = '#f07046',
}

export interface sendModDMOptions {
	action: PunishmentTypes;
	expire?: Date;
	punishment: any;
	automod?: boolean;
	appeal?: boolean;
}

export interface createModLogOptions {
	action: PunishmentTypes;
	punishmentId?: string;
	user: User;
	moderator: User;
	reason: string;
	duration?: number;
	referencedPunishment?: any;
	expire?: Date;
	revoke?: boolean;
	update?: boolean;
}

export interface createAntiraidLogOptions {
	affected: number;
	moderator: User;
	reason: string;
	registered: number;
	joined: number;
	results: string;
}

// Modmail

export enum ModmailActionTypes {
	Open = 'OPEN',
	Close = 'CLOSE',
	BlacklistAdd = 'BLACKLIST_ADD',
	BlacklistRemove = 'BLACKLIST_REMOVE',
}

export enum modmailActionTypeEmbedColors {
	'OPEN' = '#95b874',
	'CLOSE' = '#b89b74',
	'BLACKLIST_ADD' = '#b04646',
	'BLACKLIST_REMOVE' = '#60b3b1',
}

type modmailTicketTypes = 'DIRECT' | 'REQUEST';

export interface modmailTicketData {
	id: number;
	userId: Snowflake;
	type: modmailTicketTypes;
	url: string;
	createdAt: Date;
}

interface ticketData {
	type: modmailTicketTypes;
	channel: TextChannel;
}

export interface createModmailLogOptions {
	action: ModmailActionTypes;
	ticketId?: Number;
	user: User;
	moderator?: User;
	ticket?: ticketData;
	reason?: string;
	transcript?: string;
	referencedCaseUrl?: string;
}

// Paginator

export type PaginatorInteractionTypes = CommandInteraction | UserContextMenuCommandInteraction | ModalSubmitInteraction;

export interface paginatorOptions {
	array: any[];
	itemPerPage: number;
	joinWith?: string;
	time: number;
	embed: EmbedBuilder;
	ephemeral?: boolean;
	// searchButton: boolean;
}

export interface paginatorStatusOptions {
	totalPages: number;
	currentPage: number;
	slice1: number;
	slice2: number;
}

// Emojis Config

export type EmojisConfigTypes =
	| 'success'
	| 'error'
	| 'attention'
	| 'ping'
	| 'mongoDB'
	| 'online'
	| 'idle'
	| 'dnd'
	| 'offline';

export interface emojisConfigTypes {
	success: string;
	error: string;
	attention: string;
	ping: string;
	mongoDB: string;
	online: string;
	idle: string;
	dnd: string;
	offline: string;
}

export enum emojisConfigDefaults {
	success = '✅',
	error = '❌',
	attention = '❗️',
	ping = '🔘',
	mongoDB = '🌿',
	online = '🟢',
	idle = '🟡',
	dnd = '🔴',
	offline = '🔘',
}

// General config

export type GeneralConfigTypes = 'developers' | 'appealLink' | 'memberRoleId' | 'modmailCategoryId';

export const generalConfigIdType: GeneralConfigTypes[] = ['memberRoleId', 'modmailCategoryId'];

// Moderation config

export type ModerationConfigTypes = 'counts' | 'durations' | 'defaults' | 'reasons';

// Verification

export enum VerificationModes {
	Matching = 1,
	Modal = 2,
	Selection = 3,
}

// Collections

export type GuardCollectionTypes = `antiraid` | `warn:${string}` | `purge:${string}` | `lockdown`;

export type ModmailCollectionTypes = `slowmode:${string}` | `cooldown:${string}` | `confirmation:${string}`;

// Other

export interface ignoreFunctionOptions {
	interaction: CommandInteraction;
	action: PunishmentTypes;
}

export interface antiRaidHitData {
	userId: string;
	punishmentId: string;
}

export interface userinfoButtonsOptions {
	disableAccount?: boolean;
	disableGuild?: boolean;
}

export const deleteDayRewites = {
	0: "Don't delete any",
	1: 'Previous 24 hours',
	2: 'Previous 48 hours',
	3: 'Previous 3 days',
	4: 'Previous 4 days',
	5: 'Previous 5 days',
	6: 'Previous 6 days',
	7: 'Previous 7 days',
};

export const Emojis = {
	0: '0️⃣',
	1: '1️⃣',
	2: '2️⃣',
	3: '3️⃣',
	4: '4️⃣',
	5: '5️⃣',
	6: '6️⃣',
	7: '7️⃣',
	8: '8️⃣',
	9: '9️⃣',
	10: '🔟',
};
