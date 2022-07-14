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

export enum automodModulesNames {
	'badwords' = 'Filtered words',
	'invites' = 'Discord invites',
	'largeMessage' = 'Large messages',
	'massMention' = 'Mass mentions',
	'massEmoji' = 'Mass emoji',
	'spam' = 'Spam',
	'capitals' = 'Too many caps',
	'urls' = 'Urls and links',
}

export enum automodModuleReasons {
	'badwords' = 'Sending filtered words in the chat.',
	'invites' = 'Sending discord invite links in the chat.',
	'largeMessage' = 'Sending a large message in content.',
	'massMention' = 'Mentioning more than 4 people.',
	'massEmoji' = 'Sending too many emojis at once.',
	'spam' = 'Sending messages too quickly.',
	'capitals' = 'Using too many capital letters.',
	'urls' = 'Sending links and urls.',
}

// Logging system and modules typings

export type LoggingModules = 'mod' | 'message' | 'modmail' | 'servergate' | 'voice';

export enum loggingModulesNames {
	'mod' = 'Moderation Logging',
	'message' = 'Message Logging',
	'modmail' = 'Modmail Logging',
	'servergate' = 'Joins and Leaves',
	'voice' = 'Voice State Updates',
}

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

export enum punismentTypeNamesSuffixes {
	'WARN' = 'in',
	'BAN' = 'from',
	'KICK' = 'from',
	'TIMEOUT' = 'in',
	'UNBAN' = 'from',
	'SOFTBAN' = 'from',
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

export type PaginatorInteractionTypes =
	| CommandInteraction
	| UserContextMenuCommandInteraction
	| ModalSubmitInteraction;

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
	disableRoles?: boolean;
	disablePermissions?: boolean;
}

export type GuardCollectionTypes = `antiraid` | `warn:${string}` | `purge:${string}` | `lockdown`;

