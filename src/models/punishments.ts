import mongoose from 'mongoose';
import { default_config } from '../json/moderation.json';

const schema = new mongoose.Schema({
	_id: String,
	case: Number,
	type: String,
	userId: String,
	moderatorId: String,
	reason: { type: String, default: default_config.reason },
	date: Date,
	expire: Date,
});

export const punishmentModel = mongoose.model('punishment', schema);

schema.index({ expire: 1 }, { expireAfterSeconds: 0 });
