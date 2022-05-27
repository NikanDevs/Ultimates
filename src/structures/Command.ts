import { interactionType } from '../typings/Command';

export class Command {
	constructor(interaction: interactionType) {
		Object.assign(this, interaction);
	}
}
