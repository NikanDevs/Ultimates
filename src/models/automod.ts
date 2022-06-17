import { Snowflake } from 'discord.js';
import mongoose from 'mongoose';
import { client } from '..';
import { PunishmentType } from '../typings/PunishmentType';

type T = {
	_id: string;
	case: number;
	type: PunishmentType;
	userId: string | Snowflake;
	reason: string;
	date: Date;
	expire: Date;
};

const schema = new mongoose.Schema({
	_id: String,
	case: Number,
	type: String,
	userId: String,
	reason: { type: String, default: client.config.moderation.default.reason },
	date: Date,
	expire: Date,
});

schema.index({ expire: 1 }, { expireAfterSeconds: 0 });

export const automodModel = mongoose.model<T>('automod', schema);
