"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
class Logger {
    timezone = 'en-US';
    current = new Date().toLocaleTimeString(this.timezone, {
        timeZoneName: 'long',
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    support = chalk_1.default.Level === 0 ? false : true;
    constructor(options) {
        this.timezone = options.timezone;
    }
    born() {
        this.info('Logger started', { showDate: false });
    }
    error(options) {
        const current = chalk_1.default.gray.italic(this.current);
        const header = chalk_1.default.redBright.bold('[ERROR]');
        const source = chalk_1.default.blueBright(options.source);
        const reason = this.formatReason(options.reason);
        console.log(['\n', current, `${header} ${chalk_1.default.cyan('•')} ${source}`, reason].join('\n'));
        return true;
    }
    warn(options) {
        const current = chalk_1.default.gray.italic(this.current);
        const header = chalk_1.default.yellowBright.bold('[WARN]');
        const source = chalk_1.default.blueBright(options.source);
        const reason = this.formatReason(options.reason);
        console.log(['\n', current, `${header} ${chalk_1.default.cyan('•')} ${source}`, reason].join('\n'));
        return true;
    }
    info(message, options) {
        const current = chalk_1.default.gray.italic(this.current);
        const header = chalk_1.default.yellowBright.bold('[INFO]');
        const source = chalk_1.default.blueBright(options?.source);
        const reason = chalk_1.default.whiteBright(message);
        const showDate = options.showDate !== null ? options.showDate : true;
        console.log([
            showDate ? '\n' : '\nLINE_BREAK',
            showDate ? current : 'LINE_BREAK',
            `${header} ${chalk_1.default.cyan('•')} ${source === undefined ? reason : reason}`,
            `${source === undefined ? reason : 'LINE_BREAK'}`,
        ]
            .join('\n')
            .replaceAll(/\n?LINE_BREAK\n?/g, ''));
        return true;
    }
    formatReason(reason) {
        const name = reason.name;
        const message = reason.message.replaceAll(name, '');
        const stack = reason.stack
            .replaceAll(name, '')
            .replace(':', '')
            .replaceAll(`${message}\n`, '');
        return (chalk_1.default.whiteBright.bold(name) +
            ': ' +
            chalk_1.default.whiteBright(message) +
            '\n' +
            chalk_1.default.white(stack));
    }
}
exports.Logger = Logger;
