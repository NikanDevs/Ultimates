type type =
	| 'Short Time'
	| 'Long Time'
	| 'Short Date'
	| 'Long Date'
	| 'Short Date/Time'
	| 'Long Date/Time'
	| 'Relative Time';

export function generateDiscordTimestamp(date: Date, type?: type) {
	type ? type : (type = 'Relative Time');
	enum unix {
		'Short Time' = 't',
		'Long Time' = 'T',
		'Short Date' = 'd',
		'Long Date' = 'D',
		'Short Date/Time' = 'f',
		'Long Date/Time' = 'F',
		'Relative Time' = 'R',
	}

	return `<t:${Math.floor(date.getTime() / 1000)}:${unix[type]}>`;
}

