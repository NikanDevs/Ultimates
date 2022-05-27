import { modmailModel } from '../../models/modmail';

export async function getModmailTicket() {
	const data = await modmailModel.findById('substance');
	return data.currentTicket;
}

export async function addModmailTicket() {
	const data = await modmailModel.findById('substance');
	const currentTicket = data.currentTicket;

	await modmailModel.findByIdAndUpdate('substance', {
		$set: { currentTicket: currentTicket + 1 },
	});
}
