import { checkUnbans } from './jobs/unbanTimers';
import { checkUnmutes } from './jobs/unmuteTimers';
import { logger } from './logger';

export async function registerWorkers(timeout: number) {
	logger.info('Registered workers', { showDate: false });

	setInterval(async () => {
		await checkUnmutes();
		await checkUnbans();
	}, timeout);
}

