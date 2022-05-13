import mongoose from 'mongoose';

const schema = new mongoose.Schema({
	_id: String,
	currentCase: Number,
	url: String,
	expire: Date,
});

export const logsModel = mongoose.model('logs', schema);

schema.index({ expire: 1 }, { expireAfterSeconds: 60 * 5 });
