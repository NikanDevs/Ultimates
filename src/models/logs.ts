import { Schema, model, SchemaTypes } from 'mongoose';
import type { LogsSchemaType } from '../typings/models';

const schema = new Schema({
	_id: { type: SchemaTypes.String, required: true },
	currentCase: { type: SchemaTypes.Number, required: true },
	url: { type: SchemaTypes.String, required: true },
	expire: { type: SchemaTypes.Date, required: false },
});

export const logsModel = model<LogsSchemaType>('logs', schema);
schema.index({ expire: 1 }, { expireAfterSeconds: 60 * 5 });
