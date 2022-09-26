import { EmbedBuilder, GuildMember } from 'discord.js';
import { getModCase } from '../../functions/cases/modCase';
import { guardCollection, punishmentExpiry, warningExpiry } from '../../constants';
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
import { t } from 'i18next';
import { confirm } from '../../utils/sendConfirmation';

export default new Command({
	interaction: interactions.warn,
	excute: async ({ client, interaction, options }) => {
		const member = options.getMember('member') as GuildMember;
		const reason = options.getString('reason') ?? t('common.noReason');

		if (!member)
			return interaction.reply({
				embeds: [client.embeds.error(t('common.error.invalidMember'))],
				ephemeral: true,
			});

		if (ignore(member, { interaction, action: PunishmentTypes.Warn })) return;

		if (guardCollection.has(`warn:${member.id}`))
			return interaction.reply({
				embeds: [client.embeds.attention(t('command.mod.warn.double'))],
				ephemeral: true,
			});

		await confirm(interaction, {
			confirmMessage: t('command.mod.warn.confirm', { user: member.user.tag }),
			ephemeral: true,
			callback: async () => {
				guardCollection.set(`warn:${member.id}`, null);
				setTimeout(() => {
					guardCollection.delete(`warn:${member.id}`);
				}, 10_000);

				const data = new punishmentModel({
					_id: await generateManualId(),
					case: await getModCase(),
					type: PunishmentTypes.Warn,
					userId: member.id,
					moderatorId: interaction.user.id,
					reason: reason,
					date: new Date(),
					expire: warningExpiry,
				});
				await data.save();

				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setDescription(
								t('common.modEmbed', {
									user: member.toString(),
									action: t('command.mod.warn.past'),
									id: data._id,
								})
							)
							.setColor(client.cc.moderation),
					],
					components: [],
				});

				sendModDM(member, {
					action: PunishmentTypes.Warn,
					expire: data.expire,
					punishment: data,
				});

				await createModLog({
					action: PunishmentTypes.Warn,
					punishmentId: data._id,
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
						case client.config.moderation.counts.timeout1:
							await timeoutMember(member, {
								duration: client.config.moderation.durations.timeout1,
								reason: t('command.mod.warn.reaching', {
									count: client.config.moderation.counts.timeout1,
								}),
							});

							const data = new punishmentModel({
								_id: await generateManualId(),
								case: await getModCase(),
								type: PunishmentTypes.Timeout,
								userId: member.id,
								moderatorId: client.user.id,
								reason: t('command.mod.warn.reaching', {
									count: client.config.moderation.counts.timeout1,
								}),
								date: new Date(),
								expire: new Date(
									warningExpiry.getTime() + client.config.moderation.durations.timeout1
								),
							});
							data.save();

							await createModLog({
								action: PunishmentTypes.Timeout,
								punishmentId: data._id,
								user: member.user,
								moderator: client.user,
								reason: t('command.mod.warn.reaching', {
									count: client.config.moderation.counts.timeout1,
								}),
								duration: client.config.moderation.durations.timeout1,
								referencedPunishment: data,
								expire: new Date(
									warningExpiry.getTime() + client.config.moderation.durations.timeout1
								),
							});

							sendModDM(member, {
								action: PunishmentTypes.Timeout,
								punishment: data,
								expire: new Date(Date.now() + client.config.moderation.durations.timeout1),
							});
							break;

						case client.config.moderation.counts.timeout2:
							await timeoutMember(member, {
								duration: client.config.moderation.durations.timeout2,
								reason: t('command.mod.warn.reaching', {
									count: client.config.moderation.counts.timeout2,
								}),
							});

							const data2 = new punishmentModel({
								_id: await generateManualId(),
								case: await getModCase(),
								type: PunishmentTypes.Timeout,
								userId: member.id,
								moderatorId: client.user.id,
								reason: t('command.mod.warn.reaching', {
									count: client.config.moderation.counts.timeout2,
								}),
								date: new Date(),
								expire: new Date(
									warningExpiry.getTime() + client.config.moderation.durations.timeout2
								),
							});
							data2.save();

							await createModLog({
								action: PunishmentTypes.Timeout,
								punishmentId: data2._id,
								user: member.user,
								moderator: client.user,
								reason: t('command.mod.warn.reaching', {
									count: client.config.moderation.counts.timeout2,
								}),
								duration: client.config.moderation.durations.timeout2,
								referencedPunishment: data,
								expire: new Date(
									warningExpiry.getTime() + client.config.moderation.durations.timeout1
								),
							});

							sendModDM(member, {
								action: PunishmentTypes.Timeout,
								punishment: data2,
								expire: new Date(Date.now() + client.config.moderation.durations.timeout2),
							});
							break;
						case client.config.moderation.counts.ban:
							switch (client.config.moderation.durations.ban) {
								case null:
									const data3 = new punishmentModel({
										_id: await generateManualId(),
										case: await getModCase(),
										type: PunishmentTypes.Ban,
										userId: member.id,
										moderatorId: client.user.id,
										reason: t('command.mod.warn.reaching', {
											count: client.config.moderation.counts.ban,
										}),
										date: new Date(),
										expire: punishmentExpiry,
									});
									data3.save();

									await createModLog({
										action: PunishmentTypes.Ban,
										punishmentId: data3._id,
										user: member.user,
										moderator: client.user,
										reason: t('command.mod.warn.reaching', {
											count: client.config.moderation.counts.ban,
										}),
										referencedPunishment: data,
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
										reason: t('command.mod.warn.reaching', {
											count: client.config.moderation.counts.ban,
										}),
										date: new Date(),
										expire: new Date(
											punishmentExpiry.getTime() +
												client.config.moderation.durations.ban
										),
									});
									data4.save();

									const durationData = new durationsModel({
										case: await getModCase(),
										type: PunishmentTypes.Softban,
										userId: member.user.id,
										expires: new Date(
											Date.now() + client.config.moderation.durations.ban
										),
									});
									await durationData.save();

									await createModLog({
										action: PunishmentTypes.Softban,
										punishmentId: data4._id,
										user: member.user,
										moderator: client.user,
										reason: t('command.mod.warn.reaching', {
											count: client.config.moderation.counts.ban,
										}),
										duration: client.config.moderation.durations.ban,
										referencedPunishment: data,
										expire: punishmentExpiry,
									});

									await sendModDM(member, {
										action: PunishmentTypes.Softban,
										punishment: data4,
										expire: new Date(Date.now() + client.config.moderation.durations.ban),
									});
									break;
							}

							await member.ban({
								reason: t('command.mod.warn.reaching', {
									count: client.config.moderation.counts.ban,
								}),
								deleteMessageDays: client.config.moderation.defaults.msgs,
							});
							break;
					}
				});
			},
		});
	},
});
