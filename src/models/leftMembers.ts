import mongoose from 'mongoose';

const schema = new mongoose.Schema({
	userId: String,
	roles: Array,
	expires: Number,
});

export const leftMembersModel = mongoose.model('left-members', schema);
