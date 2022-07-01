import { interactionOptions } from '../../typings';

export const pingCommand = {
	name: 'ping',
	description: "Check the bot's health",
	directory: 'utility',
	cooldown: 5000,
	permission: [],
	available: true,
} as interactionOptions;

