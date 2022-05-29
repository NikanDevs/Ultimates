import { interactionOptions } from '../../typings/Command';

export const staffCommand = {
	name: 'staff',
	description: 'Displays a list of available staff members',
	directory: 'utility',
	cooldown: 5000,
	permission: [],
	available: true,
} as interactionOptions;

