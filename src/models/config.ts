import mongoose from 'mongoose';
import { default_config } from '../json/moderation.json';

const schema = new mongoose.Schema({
	_id: String,
	mod: { type: Object },
	message: { type: Object },
	modmail: { type: Object },
	servergate: { type: Object },
	error: { type: Object },
});

export const configModel = mongoose.model('config', schema);

