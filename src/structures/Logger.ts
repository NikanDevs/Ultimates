import chalk from 'chalk';
import { LoggerClientOptions, LoggerDataOptions } from '../typings';

export class Logger {
	private timezone = 'en-US';
	private readonly current = new Date().toLocaleTimeString(this.timezone, {
		timeZoneName: 'long',
		weekday: 'long',
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
	public readonly support = chalk.Level === 0 ? false : true;

	constructor(options: LoggerClientOptions) {
		this.timezone = options.timezone;
		this.info('Logger started', { showDate: false });
	}

	public error(options: LoggerDataOptions): boolean | null {
		const current = chalk.gray.italic(this.current);
		const header = chalk.redBright.bold('[ERROR]');
		const source = chalk.blueBright(options.source);
		const reason = this.formatReason(options.reason);

		console.log(['\n', current, `${header} ${chalk.cyan('•')} ${source}`, reason].join('\n'));
		return true;
	}

	public warn(options: string | LoggerDataOptions): boolean | null {
		const current = chalk.gray.italic(this.current);
		const header = chalk.yellowBright.bold('[WARN]');
		if (typeof options === 'string') {
			const reason = chalk.whiteBright(options);
			console.log(['\n', current, `${header} ${chalk.cyan('•')} ${reason}`].join('\n'));
		} else {
			const source = chalk.blueBright(options.source);
			const reason = this.formatReason(options.reason);

			console.log(['\n', current, `${header} ${chalk.cyan('•')} ${source}`, reason].join('\n'));
		}
		return true;
	}

	public info(message: string, options?: LoggerDataOptions): boolean | null {
		const current = chalk.gray.italic(this.current);
		const header = chalk.yellowBright.bold('[INFO]');
		const source = chalk.blueBright(options?.source);
		const reason = chalk.whiteBright(message);
		const showDate = !options ? true : options.showDate;

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

	private formatReason(reason: Error) {
		const name = reason.name;
		const message = reason.message.replaceAll(name, '');
		const stack = reason.stack.replaceAll(name, '').replace(':', '').replaceAll(`${message}\n`, '');

		return chalk.whiteBright.bold(name) + ': ' + chalk.whiteBright(message) + '\n' + chalk.white(stack);
	}
}
