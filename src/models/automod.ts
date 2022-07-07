import { t } from 'i18next';
import { Schema, SchemaTypes, model } from 'mongoose';
import type { AutomodSchemaType } from '../typings/models';

const schema = new Schema({
	_id: { type: SchemaTypes.String, required: true },
	case: { type: SchemaTypes.Number, required: true },
	type: { type: SchemaTypes.Number, required: true },
	userId: { type: SchemaTypes.String, required: true },
	reason: {
		type: SchemaTypes.String,
		default: t('common.noReason'),
	},
	date: { type: SchemaTypes.Date, required: true },
	expire: { type: SchemaTypes.Date, required: true },
});

export const automodModel = model<AutomodSchemaType>('automod', schema);
schema.index({ expire: 1 }, { expireAfterSeconds: 0 });
