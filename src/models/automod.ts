import mongoose from 'mongoose';

const schema = new mongoose.Schema({
	_id: Number,
	case: String,
	type: String,
	userId: String,
	reason: String,
	timestamp: Number,
	expires: Number,
});

export const automodModel = mongoose.model('automod', schema);
