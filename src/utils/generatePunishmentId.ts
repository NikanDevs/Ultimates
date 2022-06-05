import { AUTOMOD_ID_LENGTH, PUNISHMENT_ID_LENGTH } from '../constants';

export function generateManualId() {
	const characters = '1234567890';
	let code = '';
	for (var i = 0; i < PUNISHMENT_ID_LENGTH; i++) {
		code += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return code;
}
export function generateAutomodId() {
	const characters = '1234567890';
	let code = '';
	for (var i = 0; i < AUTOMOD_ID_LENGTH; i++) {
		code += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return code;
}
