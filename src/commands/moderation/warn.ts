import { GuildMember } from 'discord.js';
import { getModCase } from '../../functions/cases/modCase';
import { MAX_REASON_LENGTH, punishmentExpiry, warningExpiry } from '../../constants';
import { ignore } from '../../functions/ignore';
import { createModLog } from '../../functions/logs/createModLog';
import { punishmentModel } from '../../models/punishments';
import { Command } from '../../structures/Command';
import { PunishmentTypes } from '../../typings';
import { generateManualId } from '../../utils/generatePunishmentId';
import { timeoutMember } from '../../utils/timeoutMember';
import { sendModDM } from '../../utils/sendModDM';
import { interactions } from '../../interactions';
import { durationsModel } from '../../models/durations';
import { splitText } from '../../functions/other/splitText';

export default new Command({
	interaction: interactions.warn,
	excute: async ({ client, interaction, options }) => {
		const member = options.getMember('member') as GuildMember;
		const reason =
			splitText(options.getString('reason'), MAX_REASON_LENGTH) ??
			client.config.moderation.default.reason;

		if (!member)
			return interaction.reply({
				embeds: [client.embeds.error('I could not find that member in this server.')],
				ephemeral: true,
			});

		if (ignore(member, { interaction, action: PunishmentTypes.Warn })) return;

		const warnData = new punishmentModel({
			_id: await generateManualId(),
			case: await getModCase(),
			type: PunishmentTypes.Warn,
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
					action: PunishmentTypes.Warn,
					id: warnData._id,
				}),
			],
			ephemeral: true,
		});

		sendModDM(member, {
			action: PunishmentTypes.Warn,
			expire: warnData.expire,
			punishment: warnData,
		});

		await createModLog({
			action: PunishmentTypes.Warn,
			punishmentId: warnData._id,
			user: member.user,
			moderator: interaction.user,
			reason: reason,
			expire: warningExpiry,
		}).then(async () => {
			// ------------------------------------- checking for auto action on warn counts --------------------------------

			const findWarnings = await punishmentModel.find({
				userId: member.id,
				type: PunishmentTypes.Warn,
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
						type: PunishmentTypes.Timeout,
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
						action: PunishmentTypes.Timeout,
						punishmentId: data._id,
						user: member.user,
						moderator: client.user,
						reason: `Reaching ${client.config.moderation.count.timeout1} warnings.`,
						duration: client.config.moderation.duration.timeout1,
						referencedPunishment: warnData,
					});

					sendModDM(member, {
						action: PunishmentTypes.Timeout,
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
						type: PunishmentTypes.Timeout,
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
						action: PunishmentTypes.Timeout,
						punishmentId: data2._id,
						user: member.user,
						moderator: client.user,
						reason: `Reaching ${client.config.moderation.count.timeout2} warnings.`,
						duration: client.config.moderation.duration.timeout2,
						referencedPunishment: warnData,
					});

					sendModDM(member, {
						action: PunishmentTypes.Timeout,
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
								type: PunishmentTypes.Ban,
								userId: member.id,
								moderatorId: client.user.id,
								reason: `Reaching ${client.config.moderation.count.ban} warnings.`,
								date: new Date(),
								expire: punishmentExpiry,
							});
							data3.save();

							await createModLog({
								action: PunishmentTypes.Ban,
								punishmentId: data3._id,
								user: member.user,
								moderator: client.user,
								reason: `Reaching ${client.config.moderation.count.ban} warnings.`,
								referencedPunishment: warnData,
								expire: punishmentExpiry,
							});

							await sendModDM(member, {
								action: PunishmentTypes.Ban,
								punishment: data3,
							});
							break;
						default:
							const data4 = new punishmentModel({
								_id: await generateManualId(),
								case: await getModCase(),
								type: PunishmentTypes.Softban,
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
								type: PunishmentTypes.Softban,
								userId: member.user.id,
								date: new Date(),
								duration: client.config.moderation.duration.ban,
							});
							await durationData.save();

							await createModLog({
								action: PunishmentTypes.Softban,
								punishmentId: data4._id,
								user: member.user,
								moderator: client.user,
								reason: `Reaching ${client.config.moderation.count.ban} warnings.`,
								duration: client.config.moderation.duration.ban,
								referencedPunishment: warnData,
								expire: punishmentExpiry,
							});

							await sendModDM(member, {
								action: PunishmentTypes.Softban,
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
