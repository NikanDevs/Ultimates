import { client } from '../..';
import { createRmPunishLog } from '../../functions/logs/createRmpunishLog';
import { automodModel } from '../../models/automod';
import { leftMembersModel } from '../../models/leftMembers';
import { logsModel } from '../../models/logs';
import { punishmentModel } from '../../models/punishments';
import { Event } from '../../structures/Event';
import { PunishmentType, RmPunishmentType } from '../../typings/PunishmentType';

export default new Event('messageCreate', async (message) => {
	// Manual warns
	const manualData = await punishmentModel.find();
	const manualFiltered = manualData?.filter((c) => Date.now() > c.expires);

	manualFiltered.forEach(async (data) => {
		await data.delete();
		if (data.type === PunishmentType.Warn) {
			await createRmPunishLog(message, {
				type: RmPunishmentType.Expire,
				user: await client.users.fetch(data.userId),
				punishment: data,
			}).then(async () => {
				await logsModel.findByIdAndDelete(data.case);
			});
		} else {
			await logsModel.findByIdAndDelete(data.case);
		}
	});

	// Automod warns
	const automodData = await automodModel.find();
	const automodFiltered = automodData?.filter((c) => Date.now() > c.expires);

	automodFiltered.forEach(async (data) => {
		await data.delete();
		if (data.type === PunishmentType.Warn) {
			await createRmPunishLog(message, {
				type: RmPunishmentType.Expire,
				user: await client.users.fetch(data.userId),
				punishment: data,
			}).then(async () => {
				await logsModel.findByIdAndDelete(data.case);
			});
		} else {
			await logsModel.findByIdAndDelete(data.case);
		}
	});

	// Left member roles
	const leftMemberData = await leftMembersModel.find();
	const leftMemberFiltered = leftMemberData?.filter((c) => Date.now() > c.expires);

	leftMemberFiltered.forEach(async (data) => {
		await data.delete();
	});
});
