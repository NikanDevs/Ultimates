import { GuildMember } from 'discord.js';
import { getModCase } from '../../functions/cases/modCase';
import {
	MAX_REASON_LENGTH,
	MAX_SOFTBAN_DURATION,
	MIN_SOFTBAN_DURATION,
	punishmentExpiry,
} from '../../constants';
import { ignore } from '../../functions/ignore';
import { createModLog } from '../../functions/logs/createModLog';
import { punishmentModel } from '../../models/punishments';
import { Command } from '../../structures/Command';
import { PunishmentTypes } from '../../typings';
import { generateManualId } from '../../utils/generatePunishmentId';
import { durationsModel } from '../../models/durations';
import { sendModDM } from '../../utils/sendModDM';
import { interactions } from '../../interactions';
import { convertTime, convertToTime, isValidTime } from '../../functions/convertTime';
import { splitText } from '../../functions/other/splitText';
import { t } from 'i18next';

export default new Command({
	interaction: interactions.softban,
	excute: async ({ client, interaction, options }) => {
		const user = options.getUser('user');
		const member = options.getMember('user') as GuildMember;
		const reason =
			splitText(options.getString('reason'), MAX_REASON_LENGTH) ?? t('common.noReason');
		const delete_messages =
			options.getNumber('delete_messages') ?? client.config.moderation.default.msgs;
		const durationO =
			options.getString('duration') ?? client.config.moderation.default.softban;
		const duration = convertToTime(durationO);

		if (member) if (ignore(member, { interaction, action: PunishmentTypes.Softban })) return;
		if (await interaction.guild.bans.fetch(user.id).catch(() => {}))
			return interaction.reply({
				embeds: [client.embeds.error('This user is already banned from the server.')],
				ephemeral: true,
			});

		if (!isValidTime(durationO))
			return interaction.reply({
				embeds: [
					client.embeds.error(
						'The provided duration is not valid, use the autocomplete for a better result.'
					),
				],
				ephemeral: true,
			});
		if (duration > MAX_SOFTBAN_DURATION || duration < MIN_SOFTBAN_DURATION)
			return interaction.reply({
				embeds: [
					client.embeds.attention(
						`The duration must be between ${convertTime(
							MIN_SOFTBAN_DURATION
						)} and ${convertTime(MAX_SOFTBAN_DURATION)}.`
					),
				],
				ephemeral: true,
			});

		const data = new punishmentModel({
			_id: await generateManualId(),
			case: await getModCase(),
			type: PunishmentTypes.Softban,
			userId: user.id,
			moderatorId: interaction.user.id,
			reason: reason,
			date: new Date(),
			expire: new Date(punishmentExpiry.getTime() + duration),
		});
		await data.save();

		if (member)
			await sendModDM(member, {
				action: PunishmentTypes.Softban,
				punishment: data,
				expire: new Date(Date.now() + duration),
			});
		await interaction.guild.members.ban(user, {
			deleteMessageDays: delete_messages,
			reason: reason,
		});

		const durationData = new durationsModel({
			case: await getModCase(),
			type: PunishmentTypes.Softban,
			userId: user.id,
			date: new Date(),
			duration: duration,
		});
		await durationData.save();

		await interaction.reply({
			embeds: [
				client.embeds.moderation(member ? user : user.tag, {
					action: PunishmentTypes.Softban,
					id: data._id,
				}),
			],
			ephemeral: true,
		});

		await createModLog({
			action: PunishmentTypes.Softban,
			punishmentId: data._id,
			user: user,
			duration: duration,
			moderator: interaction.user,
			reason: reason,
		});
	},
});

