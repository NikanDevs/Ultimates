import { lengths } from '../json/moderation.json';

export function generateManualId() {
	const characters = '1234567890';
	let code = '';
	for (var i = 0; i < lengths['manual-id']; i++) {
		code += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return code;
}
export function generateAutomodId() {
	const characters = '1234567890';
	let code = '';
	for (var i = 0; i < lengths['automod-id']; i++) {
		code += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return code;
}
