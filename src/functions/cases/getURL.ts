import { logsModel } from '../../models/logs';

export async function getUrlFromCase(tofindCase: string | number): Promise<string> {
	const data = await logsModel.findById(tofindCase.toString());

	return data ? data.url : 'https://discord.com/404';
}
