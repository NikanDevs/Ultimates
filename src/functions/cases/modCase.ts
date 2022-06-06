import { logsModel } from '../../models/logs';

export async function getModCase(): Promise<number> {
	const data = await logsModel.findById('substance');
	return data.currentCase;
}

export async function addModCase(): Promise<boolean> {
	const data = await logsModel.findById('substance');
	const currentCase = data.currentCase;

	await logsModel.findByIdAndUpdate('substance', {
		$set: { currentCase: currentCase + 1 },
	});

	return true;
}
