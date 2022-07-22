export function splitText(text: string, length: number): string {
	if (!text) return null;
	const endsWith = '...';
	const splitValue: number = length - endsWith.length;

	if (text.length > splitValue) text = text.slice(0, splitValue) + endsWith;
	return text;
}
