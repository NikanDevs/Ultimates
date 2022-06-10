import { GuildMember } from 'discord.js';
import { getModCase } from '../../functions/cases/modCase';
import { punishmentExpiry, warningExpiry } from '../../constants';
import { ignore } from '../../functions/ignore';
import { createModLog } from '../../functions/logs/createModLog';
import { punishmentModel } from '../../models/punishments';
import { Command } from '../../structures/Command';
import { PunishmentType } from '../../typings/PunishmentType';
import { generateManualId } from '../../utils/generatePunishmentId';
import { timeoutMember } from '../../utils/timeoutMember';
import { sendModDM } from '../../utils/sendModDM';
import { interactions } from '../../interactions';
import { durationsModel } from '../../models/durations';

export default new Command({
	interaction: interactions.warn,
	excute: async ({ client, interaction, options }) => {
		const member = options.getMember('member') as GuildMember;
		const reason = options.getString('reason') || client.config.moderation.default.reason;

		if (ignore(member, { interaction, action: PunishmentType.Warn })) return;

		const warnData = new punishmentModel({
			_id: await generateManualId(),
			case: await getModCase(),
			type: PunishmentType.Warn,
			userId: member.id,
			moderatorId: interaction.user.id,
			reason: reason,
			date: new Date(),
			expire: warningExpiry,
		});
		await warnData.save();

		interaction.reply({
			embeds: [
				client.embeds.moderation(member.user, {
					action: PunishmentType.Warn,
					id: warnData._id,
				}),
			],
			ephemeral: true,
		});

		sendModDM(member, {
			action: PunishmentType.Warn,
			expire: warnData.expire,
			punishment: warnData,
		});

		await createModLog({
			action: PunishmentType.Warn,
			punishmentId: warnData._id,
			user: member.user,
			moderator: interaction.user,
			reason: reason,
			expire: warningExpiry,
		}).then(async () => {
			// ------------------------------------- checking for auto action on warn counts --------------------------------

			const findWarnings = await punishmentModel.find({
				userId: member.id,
				type: PunishmentType.Warn,
			});
			const warningsCount = findWarnings.length;

			switch (warningsCount) {
				case client.config.moderation.count.timeout1:
					await timeoutMember(member, {
						duration: client.config.moderation.duration.timeout1,
						reason: `Reaching ${client.config.moderation.count.timeout1} warnings.`,
					});

					const data = new punishmentModel({
						_id: await generateManualId(),
						case: await getModCase(),
						type: PunishmentType.Timeout,
						userId: member.id,
						moderatorId: client.user.id,
						reason: `Reaching ${client.config.moderation.count.timeout1} warnings.`,
						date: new Date(),
						expire: new Date(
							warningExpiry.getTime() +
								client.config.moderation.duration.timeout1
						),
					});
					data.save();

					await createModLog({
						action: PunishmentType.Timeout,
						punishmentId: data._id,
						user: member.user,
						moderator: client.user,
						reason: `Reaching ${client.config.moderation.count.timeout1} warnings.`,
						duration: client.config.moderation.duration.timeout1,
						referencedPunishment: warnData,
					});

					sendModDM(member, {
						action: PunishmentType.Timeout,
						punishment: data,
						expire: new Date(
							Date.now() + client.config.moderation.duration.timeout1
						),
					});
					break;
				case client.config.moderation.count.timeout2:
					await timeoutMember(member, {
						duration: client.config.moderation.duration.timeout2,
						reason: `Reaching ${client.config.moderation.count.timeout2} warnings.`,
					});

					const data2 = new punishmentModel({
						_id: await generateManualId(),
						case: await getModCase(),
						type: PunishmentType.Timeout,
						userId: member.id,
						moderatorId: client.user.id,
						reason: `Reaching ${client.config.moderation.count.timeout2} warnings.`,
						date: new Date(),
						expire: new Date(
							warningExpiry.getTime() +
								client.config.moderation.duration.timeout2
						),
					});
					data2.save();

					await createModLog({
						action: PunishmentType.Timeout,
						punishmentId: data2._id,
						user: member.user,
						moderator: client.user,
						reason: `Reaching ${client.config.moderation.count.timeout2} warnings.`,
						duration: client.config.moderation.duration.timeout2,
						referencedPunishment: warnData,
					});

					sendModDM(member, {
						action: PunishmentType.Timeout,
						punishment: data2,
						expire: new Date(
							Date.now() + client.config.moderation.duration.timeout2
						),
					});
					break;
				case client.config.moderation.count.ban:
					switch (client.config.moderation.duration.ban) {
						case null:
							const data3 = new punishmentModel({
								_id: await generateManualId(),
								case: await getModCase(),
								type: PunishmentType.Ban,
								userId: member.id,
								moderatorId: client.user.id,
								reason: `Reaching ${client.config.moderation.count.ban} warnings.`,
								date: new Date(),
								expire: punishmentExpiry,
							});
							data3.save();

							await createModLog({
								action: PunishmentType.Ban,
								punishmentId: data3._id,
								user: member.user,
								moderator: client.user,
								reason: `Reaching ${client.config.moderation.count.ban} warnings.`,
								referencedPunishment: warnData,
								expire: punishmentExpiry,
							});

							await sendModDM(member, {
								action: PunishmentType.Ban,
								punishment: data3,
							});
							break;
						default:
							const data4 = new punishmentModel({
								_id: await generateManualId(),
								case: await getModCase(),
								type: PunishmentType.Softban,
								userId: member.id,
								moderatorId: client.user.id,
								reason: `Reaching ${client.config.moderation.count.ban} warnings.`,
								date: new Date(),
								expire: new Date(
									punishmentExpiry.getTime() +
										client.config.moderation.duration.ban
								),
							});
							data4.save();

							const durationData = new durationsModel({
								case: await getModCase(),
								type: PunishmentType.Softban,
								userId: member.user.id,
								date: new Date(),
								duration: client.config.moderation.duration.ban,
							});
							await durationData.save();

							await createModLog({
								action: PunishmentType.Softban,
								punishmentId: data4._id,
								user: member.user,
								moderator: client.user,
								reason: `Reaching ${client.config.moderation.count.ban} warnings.`,
								duration: client.config.moderation.duration.ban,
								referencedPunishment: warnData,
								expire: punishmentExpiry,
							});

							await sendModDM(member, {
								action: PunishmentType.Softban,
								punishment: data4,
								expire: new Date(
									Date.now() + client.config.moderation.duration.ban
								),
							});
							break;
					}

					await member.ban({
						reason: `Reaching ${client.config.moderation.count.ban} warnings.`,
						deleteMessageDays: client.config.moderation.default.msgs,
					});
					break;
			}
		});
	},
});
