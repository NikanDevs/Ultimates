import { Schema, model, SchemaTypes } from 'mongoose';
import type { DurationsSchemaType } from '../typings/models';

const schema = new Schema({
	case: { type: SchemaTypes.Number, required: true },
	type: { type: SchemaTypes.String, required: true },
	userId: { type: SchemaTypes.String, required: true },
	expires: { type: SchemaTypes.Date, required: true },
});

export const durationsModel = model<DurationsSchemaType>('durations', schema);
