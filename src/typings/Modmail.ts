import { Snowflake } from 'discord.js';

export enum ModmailActionType {
	Open = 'OPEN',
	Close = 'CLOSE',
	BlacklistAdd = 'BLACKLIST_ADD',
	BlacklistRemove = 'BLACKLIST_REMOVE',
}

export interface ModmailTicketData {
	id: Number;
	userId: Snowflake;
	type: 'DIRECT' | 'REQUEST';
	url: string;
	createdAt: Date;
}
