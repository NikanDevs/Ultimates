import { client } from '../..';

export function logActivity(type: 'mod' | 'message' | 'modmail' | 'servergate') {
	if (
		client.databaseConfig.logsActive[type] === null ||
		client.databaseConfig.logsActive[type] === false
	) {
		return false;
	} else return true;
}

