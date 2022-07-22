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
			if (time < 1000) return `${time} millisecond${time === 1 ? '' : 's'}`;

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

			const yearS = !yearsTimestamp ? '' : `${yearsTimestamp} year` + (yearsTimestamp === 1 ? '' : 's');
			const dayS = !daysTimestamp ? '' : `${daysTimestamp} day` + (daysTimestamp === 1 ? '' : 's');
			const hourS = !hoursTimestamp ? '' : `${hoursTimestamp} hour` + (hoursTimestamp === 1 ? '' : 's');
			const minuteS = !minutesTimestamp
				? ''
				: `${minutesTimestamp} minute` + (minutesTimestamp === 1 ? '' : 's');
			const secondS = !secondsTimestamp
				? ''
				: `${secondsTimestamp} second` + (secondsTimestamp === 1 ? '' : 's');

			const result = [yearS, /**monthS, weekS,**/ dayS, hourS, minuteS, secondS].filter((item) => item !== '');
			return result.join(' and ');
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
					case 'years':
					case 'year':
					case 'yrs':
					case 'yr':
					case 'y':
						item.replaceAll(timeFormatRegxp, '').trim();
						miliseconds = miliseconds + parseInt(item) * 360 * 24 * 60 * 60;
						break;
					case 'days':
					case 'day':
					case 'd':
						item.replaceAll(timeFormatRegxp, '').trim();
						miliseconds = miliseconds + parseInt(item) * 24 * 60 * 60 * 1000;
						break;
					case 'hours':
					case 'hour':
					case 'hrs':
					case 'hr':
					case 'h':
						item.replaceAll(timeFormatRegxp, '').trim();
						miliseconds = miliseconds + parseInt(item) * 60 * 60 * 1000;
						break;
					case 'minutes':
					case 'minute':
					case 'mins':
					case 'min':
					case 'm':
						item.replaceAll(timeFormatRegxp, '').trim();
						miliseconds = miliseconds + parseInt(item) * 60 * 1000;
						break;
					case 'seconds':
					case 'second':
					case 'secs':
					case 'sec':
					case 's':
						item.replaceAll(timeFormatRegxp, '').trim();
						miliseconds = miliseconds + parseInt(item) * 1000;
						break;
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
