import { Schema, model, SchemaTypes } from 'mongoose';
import type { ConfigSchemaType } from '../typings/models';

const schema = new Schema({
	_id: { type: SchemaTypes.String },
	// general config
	developers: { type: SchemaTypes.Array, required: false },
	appealLink: { type: SchemaTypes.String, required: false },
	memberRoleId: { type: SchemaTypes.String, required: false },
	modmailCategoryId: { type: SchemaTypes.String, required: false },
	// moderation config
	count: { type: Object, required: false },
	duration: { type: Object, required: false },
	default: { type: Object, required: false },
	reasons: { type: Object, required: false },
	// automod config
	filteredWords: { type: SchemaTypes.Array, required: false },
	modules: { type: Object, required: false },
	// logging config
	logging: { type: Object, required: false },
	// ignores config
	automod: { type: Object, required: false },
	logs: { type: Object, required: false },
});

export const configModel = model<ConfigSchemaType>('config', schema);

