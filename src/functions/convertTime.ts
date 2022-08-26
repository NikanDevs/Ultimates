import { t } from 'i18next';

export const timeFormatRegxp =
	/^(?<value>-?(?:\d+)?\.?\d+) *(?<type>milliseconds?|ms?|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/gi;

export function convertTime(time: number | string): string {
	if (/^\d+$/.test(time.toString())) {
		time = time as number;
	} else {
		time = time as string;
	}
	switch (typeof time) {
		case 'number':
			if (time < 1000) return `${time} ${t('function.convertTime.millisecond', { count: time })}`;

			// Calculating each value
			const yearsTimestamp = Math.floor(time / (365 * 24 * 60 * 60 * 1000));
			time -= yearsTimestamp * 365 * 24 * 60 * 60 * 1000;
			const daysTimestamp = Math.floor(time / (24 * 60 * 60 * 1000));
			time -= daysTimestamp * 24 * 60 * 60 * 1000;
			const hoursTimestamp = Math.floor(time / (60 * 60 * 1000));
			time -= hoursTimestamp * 60 * 60 * 1000;
			const minutesTimestamp = Math.floor(time / (60 * 1000));
			time -= minutesTimestamp * 60 * 1000;
			const secondsTimestamp = Math.floor(time / 1000);

			const yearS = !yearsTimestamp
				? ''
				: `${yearsTimestamp} ${t('function.convertTime.year', { count: yearsTimestamp })}`;
			const dayS = !daysTimestamp
				? ''
				: `${daysTimestamp} ${t('function.convertTime.day', { count: daysTimestamp })}`;
			const hourS = !hoursTimestamp
				? ''
				: `${hoursTimestamp} ${t('function.convertTime.hour', { count: hoursTimestamp })}`;
			const minuteS = !minutesTimestamp
				? ''
				: `${minutesTimestamp} ${t('function.convertTime.minute', { count: minutesTimestamp })}`;
			const secondS = !secondsTimestamp
				? ''
				: `${secondsTimestamp} ${t('function.convertTime.second', { count: secondsTimestamp })}`;

			const result = [yearS, dayS, hourS, minuteS, secondS].filter((item) => item !== '');
			return result.join(` ${t('function.convertTime.and')} `);
		case 'string':
			let miliseconds = 0;
			const values = time
				.trim()
				.split(/and|&|,/)
				.map((foo) => foo.trim());

			for (const item of values) {
				if (!timeFormatRegxp.test(item) || /^\d+$/.test(item)) {
					miliseconds = 0;
					break;
				}
				switch (item.replaceAll(/[0-9]/g, '').trim().toLowerCase()) {
					case t('function.convertTime.year', { count: 2 }):
					case t('function.convertTime.year', { count: 1 }):
					case 'years':
					case 'year':
					case 'yrs':
					case 'yr':
					case 'y':
						item.replaceAll(timeFormatRegxp, '').trim();
						miliseconds = miliseconds + parseInt(item) * 360 * 24 * 60 * 60;
						break;
					case t('function.convertTime.day', { count: 2 }):
					case t('function.convertTime.day', { count: 1 }):
					case 'days':
					case 'day':
					case 'd':
						item.replaceAll(timeFormatRegxp, '').trim();
						miliseconds = miliseconds + parseInt(item) * 24 * 60 * 60 * 1000;
						break;
					case t('function.convertTime.hour', { count: 2 }):
					case t('function.convertTime.hour', { count: 1 }):
					case 'hours':
					case 'hour':
					case 'hrs':
					case 'hr':
					case 'h':
						item.replaceAll(timeFormatRegxp, '').trim();
						miliseconds = miliseconds + parseInt(item) * 60 * 60 * 1000;
						break;
					case t('function.convertTime.minute', { count: 2 }):
					case t('function.convertTime.minute', { count: 1 }):
					case 'minutes':
					case 'minute':
					case 'mins':
					case 'min':
					case 'm':
						item.replaceAll(timeFormatRegxp, '').trim();
						miliseconds = miliseconds + parseInt(item) * 60 * 1000;
						break;
					case t('function.convertTime.second', { count: 2 }):
					case t('function.convertTime.second', { count: 1 }):
					case 'seconds':
					case 'second':
					case 'secs':
					case 'sec':
					case 's':
						item.replaceAll(timeFormatRegxp, '').trim();
						miliseconds = miliseconds + parseInt(item) * 1000;
						break;
					case t('function.convertTime.millisecond', { count: 2 }):
					case t('function.convertTime.millisecond', { count: 1 }):
					case 'milliseconds':
					case 'millisecond':
					case 'ms':
						item.replaceAll(timeFormatRegxp, '').trim();
						miliseconds = miliseconds + parseInt(item);
						break;
					default:
						miliseconds = 0;
				}
			}

			return miliseconds !== 0 ? miliseconds.toString() : undefined;
	}
}

export function isValidTime(v: string | number): boolean {
	if (typeof v === 'number') return true;
	if (/^\d+$/.test(v.toString().trim())) return true;

	if (convertTime(v.toString().trim()) === undefined) return false;
	else return true;
}

export function convertToTime(v: string | number): number {
	if (typeof v === 'number') return v;
	if (/^\d+$/.test(v.toString())) return parseInt(v);

	if (!isValidTime(v)) return undefined;
	else return +convertTime(v);
}
