import { commandType } from '../typings/Command';

export class Command {
	constructor(options: commandType) {
		Object.assign(this, options);
	}
}
