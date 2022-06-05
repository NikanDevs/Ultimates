import {
	ColorResolvable,
	Util,
} from 'discord.js';
import {
	buildConfirmationButtons,
	buildPaginationButtons,
	capitalizeFunction,
	splitTextFunction,
} from './functions';

export class clientUtil {
	resolve = {
		color: (color: ColorResolvable) => {
			return Util.resolveColor(color);
		},
	};
	build = {
		confirmationButtons: buildConfirmationButtons,
		paginator: buildPaginationButtons,
	};
	capitalize = capitalizeFunction;
	splitText = splitTextFunction;
}
