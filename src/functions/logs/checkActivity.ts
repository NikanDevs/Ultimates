import { client } from '../..';

export function logActivity(type: 'mod' | 'message' | 'modmail' | 'servergate') {
	if (client.config.logsActive[type] === null || client.config.logsActive[type] === false) {
		return false;
	} else return true;
}

