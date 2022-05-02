import mongoose from 'mongoose';

const schema = new mongoose.Schema({
	_id: { type: String },
	currentTicket: { type: Number, required: false, unique: true },
	openedTickets: { type: Array, required: false },
	moderatorId: { type: String, required: false },
	reason: { type: String, required: false },
	url: { type: String, required: false },
});

export const modmailModel = mongoose.model('modmail', schema);
