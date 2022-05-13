import mongoose from 'mongoose';

const schema = new mongoose.Schema({
	userId: String,
	roles: Array,
	expire: Date,
});

export const leftMembersModel = mongoose.model('left-members', schema);

schema.index({ expire: 1 }, { expireAfterSeconds: 0 });
