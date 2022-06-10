import { GuildMember } from 'discord.js';
import { Command } from '../../structures/Command';
import { punishmentModel } from '../../models/punishments';
import { MAX_TIMEOUT_DURATION, MIN_TIMEOUT_DURATION, warningExpiry } from '../../constants';
import { durationsModel } from '../../models/durations';
import { PunishmentType } from '../../typings/PunishmentType';
import { generateManualId } from '../../utils/generatePunishmentId';
import { getModCase } from '../../functions/cases/modCase';
import { createModLog } from '../../functions/logs/createModLog';
import { timeoutMember } from '../../utils/timeoutMember';
import { ignore } from '../../functions/ignore';
import { sendModDM } from '../../utils/sendModDM';
import { interactions } from '../../interactions';
import { convertTime, convertToTimestamp, isValidDuration } from '../../functions/convertTime';

export default new Command({
	interaction: interactions.timeout,
	excute: async ({ client, interaction, options }) => {
		const member = options.getMember('member') as GuildMember;
		const durationO =
			options.getString('duration') || client.config.moderation.default.timeout;
		const duration: number = convertToTimestamp(durationO);
		const reason = options.getString('reason') || client.config.moderation.default.reason;

		if (ignore(member, { interaction, action: PunishmentType.Timeout })) return;

		// Guess: moderator is trying to unmute
		if (
			['off', 'end', 'expire', 'null', '0', 'zero', 'remove'].includes(
				options.getString('duration').toLowerCase()
			)
		)
			return interaction.reply({
				embeds: [
					client.embeds.attention(
						"If you're trying to unmute a member, try using `/punishment revoke`"
					),
				],
				ephemeral: true,
			});
		if (await durationsModel.findOne({ userId: member.id }))
			return interaction.reply({
				embeds: [client.embeds.error('This member is already timed out.')],
				ephemeral: true,
			});
		if (!isValidDuration(durationO))
			return interaction.reply({
				embeds: [
					client.embeds.error(
						'The provided duration is not valid, use the autocomplete for a better result.'
					),
				],
				ephemeral: true,
			});
		if (duration > MAX_TIMEOUT_DURATION || duration < MIN_TIMEOUT_DURATION)
			return interaction.reply({
				embeds: [
					client.embeds.attention(
						`The duration must be between ${convertTime(
							MIN_TIMEOUT_DURATION
						)} and ${convertTime(MAX_TIMEOUT_DURATION)}.`
					),
				],
				ephemeral: true,
			});

		await timeoutMember(member, { duration: duration, reason: reason });

		const data = new punishmentModel({
			_id: await generateManualId(),
			case: await getModCase(),
			type: PunishmentType.Timeout,
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
					action: PunishmentType.Timeout,
					id: data._id,
				}),
			],
			ephemeral: true,
		});

		await sendModDM(member, {
			action: PunishmentType.Timeout,
			punishment: data,
			expire: new Date(Date.now() + duration),
		});

		await createModLog({
			action: PunishmentType.Timeout,
			punishmentId: data._id,
			duration: duration,
			user: member.user,
			moderator: interaction.user,
			reason: reason,
		});
	},
});
