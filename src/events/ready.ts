import { logger } from '../logger';
import { Event } from '../structures/Event';
import { registerWorkers } from '../workers';

export default new Event('ready', async (client) => {
	logger.info(`Logged in as ${client.user.tag}`, { showDate: false });

	await registerWorkers(30 * 1000);
});
