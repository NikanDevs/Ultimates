import mongoose from 'mongoose';

type T = {
	_id: string;
	currentCase: number;
	url: string;
	expire: Date;
};
const schema = new mongoose.Schema({
	_id: String,
	currentCase: Number,
	url: String,
	expire: Date,
});

export const logsModel = mongoose.model<T>('logs', schema);

schema.index({ expire: 1 }, { expireAfterSeconds: 60 * 5 });
