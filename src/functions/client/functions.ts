import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

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
export function splitTextFunction(text: string, length: number): string {
	if (!text) return null;
	const endsWith = '...';
	const splitValue: number = length - endsWith.length;

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
