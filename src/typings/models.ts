import { type Snowflake } from 'discord.js';
import { PunishmentTypes } from '.';

// Automod

export type AutomodSchemaType = {
	_id: string;
	case: number;
	type: PunishmentTypes;
	userId: Snowflake;
	reason?: string;
	date: Date;
	expire: Date;
};

// Config

type configIds = 'general' | 'moderation' | 'automod' | 'logging' | 'ignores';
export type ConfigSchemaType = {
	_id: configIds;

	// general config
	ownerId?: string;
	developers?: string[];
	guild?: {
		id?: string;
		appealLink?: string;
		memberRoleId?: string | Snowflake;
		modmailCategoryId?: string | Snowflake;
	};

	// moderation config
	count?: {
		timeout1?: number;
		timeout2?: number;
		ban?: number;
		automod?: number;
	};
	duration?: {
		timeout1?: number;
		timeout2?: number;
		ban?: number;
		automod?: number;
	};
	default?: {
		timeout?: number;
		softban?: number;
		msgs?: number;
	};
	reasons?: {
		warn?: string[];
		timeout?: string[];
		ban?: string[];
		softban?: string[];
		unban?: string[];
		kick?: string[];
	};

	// automod config
	filteredWords?: string[];
	modules?: {
		badwords?: boolean;
		invites?: boolean;
		largeMessage?: boolean;
		massMention?: boolean;
		massEmoji?: boolean;
		spam?: boolean;
		capitals?: boolean;
		urls?: boolean;
	};

	// logging config
	logging?: {
		mod?: { channelId?: string; webhook?: string; active?: boolean };
		modmail?: { channelId?: string; webhook?: string; active?: boolean };
		message?: { channelId?: string; webhook?: string; active?: boolean };
		servergate?: { channelId?: string; webhook?: string; active?: boolean };
		voice?: { channelId?: string; webhook?: string; active?: boolean };
	};

	// ignores config
	automod?: {
		badwords?: { channelIds?: string[]; roleIds?: string[] };
		invites?: { channelIds?: string[]; roleIds?: string[] };
		largeMessage?: { channelIds?: string[]; roleIds?: string[] };
		massMention?: { channelIds?: string[]; roleIds?: string[] };
		massEmoji?: { channelIds?: string[]; roleIds?: string[] };
		spam?: { channelIds?: string[]; roleIds?: string[] };
		capitals?: { channelIds?: string[]; roleIds?: string[] };
		urls?: { channelIds?: string[]; roleIds?: string[] };
	};
	logs?: {
		message?: {
			channelIds?: string[];
			roleIds?: string[];
		};
		voice?: {
			channelIds?: string[];
			roleIds?: string[];
		};
	};
};

// Durations

export type DurationsSchemaType = {
	case: number;
	type: PunishmentTypes;
	userId: Snowflake;
	expires: Date;
};

// Left Members

export type LeftMembersSchemaType = {
	userId: Snowflake;
	roles: string[];
	expire: Date;
};

// Logs

export type LogsSchemaType = {
	_id: string;
	currentCase?: number;
	url?: string;
	expire?: Date;
	antiraid?: boolean;
};

// Modmail

type ModmailTicketTypes = 'REQUEST' | 'DIRECT';
interface ModmailTicket {
	id: number;
	userId: Snowflake;
	type: ModmailTicketTypes;
	createdAt: Date;
	url: string;
}
export type ModmailSchemaType = {
	_id: string;
	currentTicket?: number;
	openedTickets?: ModmailTicket[];
	moderatorId?: Snowflake;
	reason?: string;
	url?: string;
};

// Punishments

export type PunishmentsSchemaType = {
	_id: string;
	case: number;
	type: PunishmentTypes;
	userId: Snowflake;
	moderatorId: Snowflake;
	reason: string;
	date: Date;
	expire: Date;
};

