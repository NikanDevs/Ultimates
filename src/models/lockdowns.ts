import mongoose from 'mongoose';

const schema = new mongoose.Schema({
	type: String,
	channelId: String,
	messageId: String,
	messagesArray: Array,
});

export const lockdownsModel = mongoose.model('lockdowns', schema);
