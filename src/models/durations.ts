import mongoose from 'mongoose';

const schema = new mongoose.Schema({
	case: Number,
	type: String,
	userId: String,
	endsAt: Date,
});

export const durationsModel = mongoose.model('durations', schema);
