import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
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

export function buildConfirmationButtons(firstLabel: string, secondLabel: string) {
	return new ActionRowBuilder<ButtonBuilder>().setComponents([
		new ButtonBuilder().setLabel(firstLabel).setStyle(ButtonStyle.Success).setCustomId('1'),
		new ButtonBuilder().setLabel(secondLabel).setStyle(ButtonStyle.Danger).setCustomId('2'),
	]);
}

export function buildPaginationButtons() {
	return new ActionRowBuilder<ButtonBuilder>().setComponents([
		new ButtonBuilder()
			.setCustomId('1')
			.setEmoji({ name: '◀️' })
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId('2')
			.setEmoji({ name: '▶️' })
			.setStyle(ButtonStyle.Primary),
	]);
}
