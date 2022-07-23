import { interactionOptions } from '../../typings';

export const pingCommand = {
	name: 'ping',
	description: "Check the bot's health",
	directory: 'utility',
	cooldown: 3000,
	permission: [],
	botPermission: [],
} as interactionOptions;
