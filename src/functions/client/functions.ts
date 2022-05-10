import { ButtonStyle } from 'discord.js';
import { client } from '../..';
import { EMBED_DESCRIPTION_MAX_LENGTH } from '../../constants';

// Capitalize
export function capitalizeFunction(str: string) {
	str = str.replace(/\_/g, ' ');
	const split = str.trim().split(' ');
	const splitFixed = [];
	split.forEach((e) => {
		e = e.charAt(0).toUpperCase() + e.slice(1).toLocaleLowerCase();
		splitFixed.push(e);
	});
	return splitFixed.join(' ');
}

// Split Text
type splitForTypes =
	| 'Embed Field Value'
	| 'Embed Description'
	| 'Message Content'
	| 'Embed Field Name';

interface splitOptions {
	splitFor?: splitForTypes;
	splitCustom?: number;
	endsWith?: string;
}

export function splitTextFunction(text: string, options?: splitOptions) {
	const splitFor = options?.splitFor;
	const splitCustom = options?.splitCustom;
	const endsWith = options?.endsWith ? options?.endsWith : '...';
	let splitValue: number;

	if (splitFor) {
		switch (splitFor) {
			case 'Embed Description':
				splitValue = EMBED_DESCRIPTION_MAX_LENGTH - endsWith.length;
				break;
			case 'Message Content':
				splitValue = 4000 - endsWith.length;
				break;
			case 'Embed Field Value':
				splitValue = 1024 - endsWith.length;
				break;
			case 'Embed Field Name':
				splitValue = 256 - endsWith.length;
				break;
		}
	} else if (!splitFor) {
		splitValue = splitCustom - endsWith.length;
	}

	if (text.length > splitValue) text = text.slice(0, splitValue) + endsWith;
	return text;
}

interface ConvertTimeoptions {
	joinWith?: string;
	surrounded?: string;
}

export function timeConvertFunction(time: number, options?: ConvertTimeoptions) {
	// Valuables
	const joinWith = options?.joinWith ? ` ${options?.joinWith} ` : ' and ';
	const surroundedBy = options?.surrounded ? options?.surrounded : '';
	if (!options) joinWith === 'and ';
	surroundedBy === '';

	// Calculating each value
	time = time * 1000;
	const daysTimestamp = Math.floor(time / 86400000);
	time -= daysTimestamp * 86400000;
	const hoursTimestamp = Math.floor(time / 3600000);
	time -= hoursTimestamp * 3600000;
	const minutesTimestamp = Math.floor(time / 60000);
	time -= minutesTimestamp * 60000;
	const secondsTimestamp = Math.floor(time / 1000);

	// Strings
	const daysString = daysTimestamp <= 0 ? '' : daysTimestamp == 1 ? ' day' : ' days',
		hoursString = hoursTimestamp <= 0 ? '' : hoursTimestamp == 1 ? ' hour' : ' hours',
		minutesString =
			minutesTimestamp <= 0 ? '' : minutesTimestamp == 1 ? ' minute' : ' minutes',
		secondsString =
			secondsTimestamp <= 0 ? '' : secondsTimestamp == 1 ? ' second' : ' seconds';

	// Join with
	const daysJoin = '',
		hoursJoin = daysTimestamp <= 0 ? '' : joinWith,
		minutesJoin = hoursTimestamp <= 0 ? '' : joinWith,
		secondsJoin = minutesTimestamp <= 0 ? '' : joinWith;

	// Ignoring missing time values and adding rounds
	const days =
			daysTimestamp <= 0
				? ''
				: surroundedBy + daysTimestamp.toLocaleString() + surroundedBy,
		hours =
			hoursTimestamp <= 0
				? ''
				: surroundedBy + hoursTimestamp.toLocaleString() + surroundedBy,
		minutes =
			minutesTimestamp <= 0
				? ''
				: surroundedBy + minutesTimestamp.toLocaleString() + surroundedBy,
		seconds =
			secondsTimestamp <= 0
				? ''
				: surroundedBy + secondsTimestamp.toLocaleString() + surroundedBy;

	// Final results
	const daysFinal = daysJoin + days + daysString,
		hoursFinal = hoursJoin + hours + hoursString,
		minutesFinal = minutesJoin + minutes + minutesString,
		secondsFinal = secondsJoin + seconds + secondsString;

	let output = daysFinal + hoursFinal + minutesFinal + secondsFinal;
	if (output.endsWith(joinWith)) output = output.slice(0, 0 - joinWith.length);
	return output;
}

export function buildConfirmationButtons(firstLabel: string, secondLabel: string) {
	return client.util
		.actionRow()
		.addComponents(
			client.util
				.button()
				.setLabel(firstLabel)
				.setStyle(ButtonStyle['Danger'])
				.setCustomId('1'),
			client.util
				.button()
				.setLabel(secondLabel)
				.setStyle(ButtonStyle['Success'])
				.setCustomId('2')
		);
}

export function buildPaginationButtons() {
	return client.util
		.actionRow()
		.addComponents(
			client.util
				.button()
				.setCustomId('1')
				.setEmoji({ name: client.cc.previous })
				.setStyle(ButtonStyle['Primary']),
			client.util
				.button()
				.setCustomId('2')
				.setEmoji({ name: client.cc.next })
				.setStyle(ButtonStyle['Primary'])
		);
}
