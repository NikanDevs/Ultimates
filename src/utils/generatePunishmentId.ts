import { AUTOMOD_ID_LENGTH, PUNISHMENT_ID_LENGTH } from '../constants';
import { automodModel } from '../models/automod';
import { punishmentModel } from '../models/punishments';
const characters: string = '1234567890';

export async function generateManualId(): Promise<string> {
	let code: string = '';
	let exist: boolean = true;

	while (exist) {
		code = '';
		for (var i = 0; i < PUNISHMENT_ID_LENGTH; i++) {
			code += characters.charAt(Math.floor(Math.random() * characters.length));
		}
		exist = (await punishmentModel.findById(code)) ? true : false;
	}

	return code;
}

export async function generateAutomodId() {
	let code: string = '';
	let exist: boolean = true;

	while (exist) {
		code = '';
		for (var i = 0; i < AUTOMOD_ID_LENGTH; i++) {
			code += characters.charAt(Math.floor(Math.random() * characters.length));
		}
		exist = (await automodModel.findById(code)) ? true : false;
	}

	return code;
}
