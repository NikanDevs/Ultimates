import { interactionOptions } from '../../typings';

// @ts-ignore
export const punishmentsContextmenu = {
	name: 'Punishments',
	description: 'Shows the punishments for a user',
	directory: 'moderation',
	cooldown: 5000,
	permission: ['ManageMessages'],
	type: 2,
} as interactionOptions;

