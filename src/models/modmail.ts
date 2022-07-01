import { Schema, model, SchemaTypes } from 'mongoose';
import type { ModmailSchemaType } from '../typings/models';

const schema = new Schema({
	_id: { type: SchemaTypes.String },
	currentTicket: { type: SchemaTypes.Number, required: false },
	openedTickets: { type: SchemaTypes.Array, required: false },
	moderatorId: { type: SchemaTypes.String, required: false },
	reason: { type: SchemaTypes.String, required: false },
	url: { type: SchemaTypes.String, required: false },
});

export const modmailModel = model<ModmailSchemaType>('modmail', schema);
