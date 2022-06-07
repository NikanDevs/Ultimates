import { GuildMember } from 'discord.js';
import { getModCase } from '../../functions/cases/modCase';
import { MAX_SOFTBAN_DURATION, MIN_SOFTBAN_DURATION, punishmentExpiry } from '../../constants';
import { ignore } from '../../functions/ignore';
import { createModLog } from '../../functions/logs/createModLog';
import { punishmentModel } from '../../models/punishments';
import { Command } from '../../structures/Command';
import { PunishmentType } from '../../typings/PunishmentType';
import { generateManualId } from '../../utils/generatePunishmentId';
import { durationsModel } from '../../models/durations';
import { sendModDM } from '../../utils/sendModDM';
import { interactions } from '../../interactions';
import { convertTime, convertToTimestamp } from '../../functions/convertTime';

export default new Command({
	interaction: interactions.softban,
	excute: async ({ client, interaction, options }) => {
		const user = options.getUser('user');
		const member = options.getMember('user') as GuildMember;
		const reason = options.getString('reason') || client.config.moderation.default.reason;
		const delete_messages =
			options.getNumber('delete_messages') || client.config.moderation.default.msgs;
		const durationO =
			options.getString('duration') || client.config.moderation.default.softban;
		const duration = convertToTimestamp(durationO);

		if (member) if (ignore(member, { interaction, action: PunishmentType.Softban })) return;
		if (await interaction.guild.bans.fetch(user.id).catch(() => {}))
			return interaction.reply({
				embeds: [client.embeds.error('This user is already banned from the server.')],
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
		if (duration > MAX_SOFTBAN_DURATION || duration < MIN_SOFTBAN_DURATION)
			return interaction.reply({
				embeds: [
					client.embeds.attention(
						`The duration must be between ${convertTime(
							MIN_SOFTBAN_DURATION
						)}and ${convertTime(MAX_SOFTBAN_DURATION)}.`
					),
				],
				ephemeral: true,
			});

		const data = new punishmentModel({
			_id: generateManualId(),
			case: await getModCase(),
			type: PunishmentType.Softban,
			userId: user.id,
			moderatorId: interaction.user.id,
			reason: reason,
			date: new Date(),
			expire: new Date(punishmentExpiry.getTime() + duration),
		});
		await data.save();

		if (member)
			await sendModDM(member, {
				action: PunishmentType.Softban,
				punishment: data,
				expire: new Date(duration),
			});
		await interaction.guild.members.ban(user, {
			deleteMessageDays: delete_messages,
			reason: reason,
		});

		const durationData = new durationsModel({
			case: await getModCase(),
			type: PunishmentType.Softban,
			userId: user.id,
			date: new Date(),
			endsAt: duration,
		});
		await durationData.save();

		await interaction.reply({
			embeds: [
				client.embeds.moderation(member ? user : user.tag, {
					action: PunishmentType.Softban,
					id: data._id,
				}),
			],
			ephemeral: true,
		});

		await createModLog({
			action: PunishmentType.Softban,
			punishmentId: data._id,
			user: user,
			duration: duration,
			moderator: interaction.user,
			reason: reason,
		});
	},
});

