import mongoose from 'mongoose';

const schema = new mongoose.Schema({
	case: Number,
	type: String,
	userId: String,
	date: Date,
	duration: Number,
});

export const durationsModel = mongoose.model('durations', schema);
