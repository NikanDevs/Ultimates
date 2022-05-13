import mongoose from 'mongoose';

const schema = new mongoose.Schema({
	_id: String,
	case: Number,
	type: String,
	userId: String,
	moderatorId: String,
	reason: String,
	date: Date,
	expire: Date,
});

export const punishmentModel = mongoose.model('punishment', schema);

schema.index({ expire: 1 }, { expireAfterSeconds: 0 });
