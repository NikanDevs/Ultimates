import { Snowflake } from 'discord.js';
import mongoose from 'mongoose';

type T = {
	_id: string;
	currentTicket: number;
	openedTickets: {
		id: number;
		userId: string | Snowflake;
		type: 'REQUEST' | 'DIRECT';
		createdAt: Date;
		url: string;
	}[];
	moderatorId: string | Snowflake;
	reason: string;
	url: string;
};

const schema = new mongoose.Schema({
	_id: { type: String },
	currentTicket: { type: Number, required: false },
	openedTickets: { type: Array, required: false, default: null },
	moderatorId: { type: String, required: false },
	reason: { type: String, required: false },
	url: { type: String, required: false },
});

export const modmailModel = mongoose.model<T>('modmail', schema);
