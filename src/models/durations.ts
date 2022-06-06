import { Snowflake } from 'discord.js';
import mongoose from 'mongoose';
import { PunishmentType } from '../typings/PunishmentType';

type T = {
	case: string;
	type: PunishmentType;
	userId: string | Snowflake;
	date: Date;
	duration: number;
};
const schema = new mongoose.Schema({
	case: Number,
	type: String,
	userId: String,
	date: Date,
	duration: Number,
});

export const durationsModel = mongoose.model<T>('durations', schema);
