import { Snowflake } from 'discord.js';
import mongoose from 'mongoose';

type T = {
	userId: string | Snowflake;
	roles: string[];
	expire: Date;
};
const schema = new mongoose.Schema({
	userId: String,
	roles: Array,
	expire: Date,
});

export const leftMembersModel = mongoose.model<T>('left-members', schema);

schema.index({ expire: 1 }, { expireAfterSeconds: 0 });
