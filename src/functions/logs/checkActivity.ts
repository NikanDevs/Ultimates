import { client } from '../..';

export function logActivity(type: 'mod' | 'message' | 'modmail' | 'servergate') {
	if (client.config.logging[type] === null || client.config.logging[type] === false) {
		return false;
	} else return true;
}

