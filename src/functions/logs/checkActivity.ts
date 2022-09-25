import { client } from '../..';
import { LoggingModules } from '../../typings';

export function logActivity(type: LoggingModules) {
	if (client.config.logging[type].active === null || client.config.logging[type].active === false) {
		return false;
	} else return true;
}
