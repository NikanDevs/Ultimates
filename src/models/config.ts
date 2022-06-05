import mongoose from 'mongoose';

const schema = new mongoose.Schema({
	_id: String,
	// Automod
	filteredWords: { type: Array },
	modules: { type: Object },
	badwords: { type: Array },
	invites: { type: Array },
	largeMessage: { type: Array },
	massMention: { type: Array },
	massEmoji: { type: Array },
	spam: { type: Array },
	capitals: { type: Array },
	urls: { type: Array },
	// Logs
	mod: { type: Object },
	message: { type: Object },
	modmail: { type: Object },
	servergate: { type: Object },
	error: { type: Object },
});

export const configModel = mongoose.model('config', schema);

