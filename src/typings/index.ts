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

export const automodModulesArray = [
	{ name: 'badwords', rewrite: 'Filtered words' },
	{ name: 'invites', rewrite: 'Discord invites' },
	{ name: 'largeMessage', rewrite: 'Large messages' },
	{ name: 'massMention', rewrite: 'Mass mentions' },
	{ name: 'massEmoji', rewrite: 'Mass emoji' },
	{ name: 'spam', rewrite: 'Spam' },
	{ name: 'capitals', rewrite: 'Too many capitals' },
	{ name: 'urls', rewrite: 'Urls and links' },
];

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

export enum automodModuleDescriptions {
	'badwords' = 'Gets triggered when a filtered-word gets sent in a channel. Click the button below to edit filtered-words.',
	'invites' = 'Gets triggered when a discord server invite gets sent in a channel.',
	'largeMessage' = 'Gets triggered when a very large message in content gets sent in a channel.',
	'massMention' = `Gets triggered when a person @mentions more than 4 people in a channel.`,
	'massEmoji' = 'Gets triggered when a person uses too many emojis in a single message.',
	'spam' = 'Gets triggered when a person sends message too quickly in a channel.',
	'capitals' = 'Gets triggered when a person uses too manu capital letters in a single message.',
	'urls' = 'Gets triggered when a person sends a link of any type in the chat.',
}

// Logging system and modules typings

export type LoggingModules = 'mod' | 'message' | 'modmail' | 'servergate' | 'voice';

export const supportedLoggingIgnores: LoggingModules[] = ['message', 'voice'];

export const loggingModulesArray = [
	{ name: 'mod', rewrite: 'Moderation logging' },
	{ name: 'message', rewrite: 'Message logging' },
	{ name: 'modmail', rewrite: 'Modmail logging' },
	{ name: 'servergate', rewrite: 'Joins and leaves' },
	{ name: 'voice', rewrite: 'Voice state updates' },
];

export enum loggingModulesNames {
	'mod' = 'Moderation logging',
	'message' = 'Message logging',
	'modmail' = 'Modmail logging',
	'servergate' = 'Joins and leaves',
	'voice' = 'Voice state updates',
}

export enum loggingWebhookNames {
	'mod' = 'Mod-Logs',
	'message' = 'Message-Logs',
	'modmail' = 'Modmail-Logs',
	'servergate' = 'Server-Gate',
	'voice' = 'Voice-Logs',
}

export enum loggingModuleDescriptions {
	'mod' = 'Sends all the moderation cases when a punishment is recorded.',
	'message' = 'Sends logs when a message was deleted, edited, or when a channel was purged.',
	'modmail' = 'Sends logs when someone creates, deletes a ticket, or when someone gets blacklisted.',
	'servergate' = 'Sends logs when someone joins or leaves the server.',
	'voice' = 'Sends logs when someone joins or leaves a voice channel.',
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

export enum generalConfigNames {
	'developers' = 'Developers',
	'appealLink' = 'Ban appeal link',
	'memberRoleId' = 'Member role',
	'modmailCategoryId' = 'Modmail category',
}

export const generalConfigArray = [
	{ name: 'developers', rewrite: 'Developers' },
	{ name: 'appealLink', rewrite: 'Ban appeal link' },
	{ name: 'memberRoleId', rewrite: 'Member role' },
	{ name: 'modmailCategoryId', rewrite: 'Modmail category' },
];

export enum generalConfigDescriptions {
	'developers' = 'Developers have permissions to use the `/eval` command.',
	'appealLink' = 'When a person gets banned from the server, the appeal link gets sent to them.',
	'memberRoleId' = 'Member role id is used for locking down channels and the verification module.',
	'modmailCategoryId' = 'Modmail tickets are created under this category.',
}

export const generalConfigIdType: GeneralConfigTypes[] = ['memberRoleId', 'modmailCategoryId'];

// Moderation config

export type ModerationConfigTypes = 'counts' | 'durations' | 'defaults' | 'reasons';

export enum moderationConfigNames {
	'counts' = 'Punishment counts',
	'durations' = 'Punishment durations',
	'defaults' = 'Default values',
	'reasons' = 'Command reasons',
}

export const moderationConfigArray = [
	{ name: 'counts', rewrite: 'Punishment counts' },
	{ name: 'durations', rewrite: 'Punishment durations' },
	{ name: 'defaults', rewrite: 'Default values' },
	{ name: 'reasons', rewrite: 'Command reasons' },
];

export enum moderationConfigDescriptions {
	'counts' = 'These counts are used to take automatic actions on users when they reach an amount of warnings; Timeout #1: How many manual warnings should a user have to get timed out for the 1st time; Same thing for the other options.',
	'durations' = 'These durations are used for automatic punishments users get after reaching an amount of warnings. Timeout #1: How long should the person be timed out for when reaching the first timeout goal? (You may set these goals using the "Punishment counts" option)',
	'defaults' = "The default values get used when a moderator doesn't enter their value whist using a /command.",
	'reasons' = 'The reasons are shown in specific commands options as autocompletes to make moderation easier. The max length for the reasons are 100 letters.',
}

export const moderationModulesNames = {
	counts: {
		timeout1: 'Timeout #1',
		timeout2: 'Timeout #2',
		ban: 'Ban',
		automod: 'Automod multiplication',
	},
	durations: {
		timeout1: 'Timeout #1',
		timeout2: 'Timeout #2',
		ban: 'Ban',
		automod: 'Automod',
	},
	defaults: {
		timeout: 'Timeout duration',
		softban: 'Softban duration',
		msgs: 'Delete messages days',
	},
};

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
