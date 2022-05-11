import { modmailModel } from '../../models/modmail';

export async function getModmailCase() {
	const data = await modmailModel.findById('substance');
	return data.currentTicket;
}

export async function addModmailCase() {
	const data = await modmailModel.findById('substance');
	const currentTicket = data.currentTicket;

	await modmailModel.findByIdAndUpdate('substance', {
		$set: { currentTicket: currentTicket + 1 },
	});
}
