import { client } from '../..';
import { LoggingModules } from '../../typings';

export function logActivity(type: LoggingModules) {
	if (client.config.logging[type] === null || client.config.logging[type] === false) {
		return false;
	} else return true;
}
