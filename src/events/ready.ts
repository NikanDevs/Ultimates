import { Event } from '../structures/Event';

export default new Event('ready', async (eventClient) => {
	console.log(`${eventClient.user?.tag} has logged in successfully!`);
});
