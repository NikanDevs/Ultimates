import mongoose from 'mongoose';
import { default_config } from '../json/moderation.json';

const schema = new mongoose.Schema({
	_id: Number,
	case: String,
	type: String,
	userId: String,
	reason: { type: String, default: default_config.reason },
	date: Date,
	expire: Date,
});

export const automodModel = mongoose.model('automod', schema);
