import chalk from 'chalk';

interface Options {
	timezone: string;
}
interface options {
	source?: 'unhandledRejection' | 'uncaughtException' | 'warning' | any;
	reason?: Error;
	showDate?: boolean;
	space?: boolean;
}

export class Logger {
	timezone = 'en-US';
	current = new Date().toLocaleTimeString(this.timezone, {
		timeZoneName: 'long',
		weekday: 'long',
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
	support = chalk.Level === 0 ? false : true;

	constructor(options: Options) {
		this.timezone = options.timezone;
	}

	born() {
		this.info('Logger started', { showDate: false });
	}

	error(options: options): boolean | null {
		const current = chalk.gray.italic(this.current);
		const header = chalk.redBright.bold('[ERROR]');
		const source = chalk.blueBright(options.source);
		const reason = this.formatReason(options.reason);

		console.log(['\n', current, `${header} ${chalk.cyan('•')} ${source}`, reason].join('\n'));
		return true;
	}

	warn(options: options): boolean | null {
		const current = chalk.gray.italic(this.current);
		const header = chalk.yellowBright.bold('[WARN]');
		const source = chalk.blueBright(options.source);
		const reason = this.formatReason(options.reason);

		console.log(['\n', current, `${header} ${chalk.cyan('•')} ${source}`, reason].join('\n'));
		return true;
	}

	info(message: string, options?: options): boolean | null {
		const current = chalk.gray.italic(this.current);
		const header = chalk.yellowBright.bold('[INFO]');
		const source = chalk.blueBright(options?.source);
		const reason = chalk.whiteBright(message);
		const showDate = options.showDate !== null ? options.showDate : true;

		console.log(
			[
				showDate ? '\n' : '\nLINE_BREAK',
				showDate ? current : 'LINE_BREAK',
				`${header} ${chalk.cyan('•')} ${source === undefined ? reason : reason}`,
				`${source === undefined ? reason : 'LINE_BREAK'}`,
			]
				.join('\n')
				.replaceAll(/\n?LINE_BREAK\n?/g, '')
		);
		return true;
	}

	formatReason(reason: Error) {
		const name = reason.name;
		const message = reason.message.replaceAll(name, '');
		const stack = reason.stack
			.replaceAll(name, '')
			.replace(':', '')
			.replaceAll(`${message}\n`, '');

		return (
			chalk.whiteBright.bold(name) +
			': ' +
			chalk.whiteBright(message) +
			'\n' +
			chalk.white(stack)
		);
	}
}

