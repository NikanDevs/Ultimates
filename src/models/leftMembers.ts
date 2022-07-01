import { Schema, model, SchemaTypes } from 'mongoose';
import type { LeftMembersSchemaType } from '../typings/models';

const schema = new Schema({
	userId: { type: SchemaTypes.String, required: true },
	roles: { type: SchemaTypes.Array, required: true },
	expire: { type: SchemaTypes.Date, required: true },
});

export const leftMembersModel = model<LeftMembersSchemaType>('left-members', schema);
schema.index({ expire: 1 }, { expireAfterSeconds: 0 });
