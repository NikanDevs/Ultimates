import { UltimatesClient } from './structures/Client';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
require('dotenv').config();

i18next.use(Backend).init({
	lng: 'en-US',
	fallbackLng: 'en-US',
	saveMissing: true,
	interpolation: {
		prefix: '{',
		suffix: '}',
		nestingPrefix: '${',
		nestingSuffix: '}',
	},
	backend: {
		loadPath: './locales/{lng}.json',
	},
});

export const client = new UltimatesClient();
