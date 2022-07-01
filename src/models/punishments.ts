import { Schema, model, SchemaTypes } from 'mongoose';
import { client } from '..';
import { PunishmentsSchemaType } from '../typings/models';

const schema = new Schema({
	_id: { type: SchemaTypes.String, required: true },
	case: { type: SchemaTypes.Number, required: true },
	type: { type: SchemaTypes.String, required: true },
	userId: { type: SchemaTypes.String, required: true },
	moderatorId: { type: SchemaTypes.String, required: true },
	reason: { type: String, default: client.config.moderation.default.reason },
	date: { type: SchemaTypes.Date, required: true },
	expire: { type: SchemaTypes.Date, required: true },
});

export const punishmentModel = model<PunishmentsSchemaType>('punishment', schema);
schema.index({ expire: 1 }, { expireAfterSeconds: 0 });
