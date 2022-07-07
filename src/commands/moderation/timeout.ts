import { GuildMember } from 'discord.js';
import { Command } from '../../structures/Command';
import { punishmentModel } from '../../models/punishments';
import {
	MAX_REASON_LENGTH,
	MAX_TIMEOUT_DURATION,
	MIN_TIMEOUT_DURATION,
	warningExpiry,
} from '../../constants';
import { durationsModel } from '../../models/durations';
import { PunishmentTypes } from '../../typings';
import { generateManualId } from '../../utils/generatePunishmentId';
import { getModCase } from '../../functions/cases/modCase';
import { createModLog } from '../../functions/logs/createModLog';
import { timeoutMember } from '../../utils/timeoutMember';
import { ignore } from '../../functions/ignore';
import { sendModDM } from '../../utils/sendModDM';
import { interactions } from '../../interactions';
import { convertTime, convertToTime, isValidTime } from '../../functions/convertTime';
import { splitText } from '../../functions/other/splitText';
import { t } from 'i18next';

export default new Command({
	interaction: interactions.timeout,
	excute: async ({ client, interaction, options }) => {
		const member: GuildMember = options.getMember('member') as GuildMember;
		const durationO: string | number =
			options.getString('duration') ?? client.config.moderation.default.timeout;
		const duration = convertToTime(durationO);
		const reason: string =
			splitText(options.getString('reason'), MAX_REASON_LENGTH) ?? t('common.noReason');

		if (!member)
			return interaction.reply({
				embeds: [client.embeds.error(t('common.errors.invalidMember'))],
				ephemeral: true,
			});

		if (ignore(member, { interaction, action: PunishmentTypes.Timeout })) return;

		if (await durationsModel.findOne({ userId: member.id }))
			return interaction.reply({
				embeds: [client.embeds.error('This member is already timed out.')],
				ephemeral: true,
			});

		if (!isValidTime(durationO))
			return interaction.reply({
				embeds: [client.embeds.error(t('common.$errors.invalidDuration'))],
				ephemeral: true,
			});

		if (duration > MAX_TIMEOUT_DURATION || duration < MIN_TIMEOUT_DURATION)
			return interaction.reply({
				embeds: [
					client.embeds.attention(
						t('common.errors.duration', {
							min: convertTime(MIN_TIMEOUT_DURATION),
							max: convertTime(MAX_TIMEOUT_DURATION),
						})
					),
				],
				ephemeral: true,
			});

		await timeoutMember(member, { duration: duration, reason: reason });

		const data = new punishmentModel({
			_id: await generateManualId(),
			case: await getModCase(),
			type: PunishmentTypes.Timeout,
			userId: member.id,
			moderatorId: interaction.user.id,
			reason: reason,
			date: new Date(),
			expire: new Date(warningExpiry.getTime() + duration),
		});
		await data.save();

		await interaction.reply({
			embeds: [
				client.embeds.moderation(member.user, {
					action: PunishmentTypes.Timeout,
					id: data._id,
				}),
			],
			ephemeral: true,
		});

		await sendModDM(member, {
			action: PunishmentTypes.Timeout,
			punishment: data,
			expire: new Date(Date.now() + duration),
		});

		await createModLog({
			action: PunishmentTypes.Timeout,
			punishmentId: data._id,
			duration: duration,
			user: member.user,
			moderator: interaction.user,
			reason: reason,
		});
	},
});
