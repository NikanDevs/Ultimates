import mongoose from 'mongoose';

const schema = new mongoose.Schema({
	_id: String,
	currentCase: Number,
	url: String,
});

export const logsModel = mongoose.model('logs', schema);
