import mongoose from 'mongoose';

const schema = new mongoose.Schema({
	case: Number,
	userId: String,
	unmuteAt: Number,
});

export const timeoutsModel = mongoose.model('timeouts', schema);
