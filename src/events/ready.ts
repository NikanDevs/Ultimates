import { logger } from '../logger';
import { Event } from '../structures/Event';

export default new Event('ready', async (client) => {
	logger.info(`Logged in as ${client.user.tag}`, { showDate: false });
});
