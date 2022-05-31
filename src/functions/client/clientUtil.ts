import {
	ActionRow,
	ActionRowData,
	ButtonComponent,
	ButtonComponentData,
	ColorResolvable,
	Embed,
	EmbedData,
	MessageActionRowComponentData,
	Modal,
	ModalData,
	TextInputComponentData,
	Util,
} from 'discord.js';
import {
	buildConfirmationButtons,
	buildPaginationButtons,
	capitalizeFunction,
	splitTextFunction,
} from './functions';

// type buttonStyles =
//     "Danger" | "Link" | "Primary" | "Secondary" | "Success";

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

	embed(...args: EmbedData[]) {
		return new Embed(...args);
	}
	actionRow(...args: ActionRowData<MessageActionRowComponentData | TextInputComponentData>[]) {
		return new ActionRow(...args);
	}
	button(...args: ButtonComponentData[]) {
		return new ButtonComponent(...args);
	}
	modal(...args: ModalData[]) {
		return new Modal(...args);
	}
}
