import { Event } from '../structures/Event';

export default new Event('threadCreate', async (thread) => {
	if (thread.joined) return;
	if (thread.joinable) return;

	await thread.join();
});
