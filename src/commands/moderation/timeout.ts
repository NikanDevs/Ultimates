import { GuildMember } from 'discord.js';
import { Command } from '../../structures/Command';
import { punishmentModel } from '../../models/punishments';
import { warningExpiry } from '../../constants';
import { durationsModel } from '../../models/durations';
import { PunishmentType } from '../../typings/PunishmentType';
import { generateManualId } from '../../utils/generatePunishmentId';
import { getModCase } from '../../functions/cases/modCase';
import { createModLog } from '../../functions/logs/createModLog';
import { timeoutMember } from '../../utils/timeoutMember';
import { ignore } from '../../functions/ignore';
import { default_config } from '../../json/moderation.json';
import { sendModDM } from '../../utils/sendModDM';
import { interactions } from '../../interactions';
import { convertTime } from '../../functions/convertTime';

export default new Command({
	interaction: interactions.timeout,
	excute: async ({ client, interaction, options }) => {
		const member = options.getMember('member') as GuildMember;
		const durationO = options.getString('duration') || default_config.timeout_duration;
		const duration: number = /^\d+$/.test(durationO)
			? parseInt(durationO)
			: +convertTime(durationO);
		const reason = options.getString('reason') || default_config.reason;

		if (ignore(member, { interaction, action: PunishmentType.Timeout })) return;

		// Guess: moderator is trying to unmute
		if (
			['off', 'end', 'expire', 'null', '0', 'zero', 'remove'].includes(
				durationO.toLowerCase()
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
		if (duration === undefined)
			return interaction.reply({
				embeds: [
					client.embeds.error(
						'The provided duration is not valid, use the autocomplete for a better result.'
					),
				],
				ephemeral: true,
			});
		if (duration > 1000 * 60 * 60 * 24 * 27 || duration < 10000)
			return interaction.reply({
				embeds: [
					client.embeds.attention(
						'The duration must be between 10 seconds and 27 days.'
					),
				],
				ephemeral: true,
			});

		await timeoutMember(member, { duration: duration, reason: reason });

		const data = new punishmentModel({
			_id: generateManualId(),
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
