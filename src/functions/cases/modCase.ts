import { logsModel } from '../../models/logs';

export async function getModCase() {
	const data = await logsModel.findById('substance');
	return data.currentCase;
}

export async function addModCase() {
	const data = await logsModel.findById('substance');
	const currentCase = data.currentCase;

	await logsModel.findByIdAndUpdate('substance', {
		$set: { currentCase: currentCase + 1 },
	});
}
