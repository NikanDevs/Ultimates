import { Snowflake } from 'discord.js';
import mongoose from 'mongoose';

type T = {
	type: 'SERVER' | 'CHANNEL';
	channelId: string | Snowflake;
	messageId: string | Snowflake;
	messagesArray: { channelId: string | Snowflake; messageId: string | Snowflake }[];
};

const schema = new mongoose.Schema({
	type: String,
	channelId: String,
	messageId: String,
	messagesArray: Array,
});

export const lockdownsModel = mongoose.model<T>('lockdowns', schema);
