import { AUTOMOD_MAX_CAPS } from '../../constants';

export function mostIsCap(str: string) {
	if (str.length <= 30) return false;
	const capitals: string[] = [],
		nonCapitals: string[] = [],
		allStr = str
			.replaceAll(' ', '')
			.split('')
			.filter((foo) => foo.match(/^[A-Za-z]+$/));

	if (!allStr) return false;
	allStr.forEach((str) => {
		if (str === str.toUpperCase()) capitals.push(str);
		else if (str === str.toLowerCase()) nonCapitals.push(str);
	});

	if (capitals.length > nonCapitals.length) {
		if ((capitals.length / nonCapitals.length) * 100 > AUTOMOD_MAX_CAPS) return true;
		else return false;
	} else return false;
}

