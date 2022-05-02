import mongoose from 'mongoose';

const schema = new mongoose.Schema({
	_id: String,
	case: Number,
	type: String,
	userId: String,
	moderatorId: String,
	reason: String,
	timestamp: Number,
	expires: Number,
});

export const punishmentModel = mongoose.model('punishment', schema);
