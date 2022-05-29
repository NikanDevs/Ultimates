import { GuildMember } from 'discord.js';
import { getModCase } from '../../functions/cases/modCase';
import { punishmentExpiry } from '../../constants';
import { getsIgnored } from '../../functions/getsIgnored';
import { createModLog } from '../../functions/logs/createModLog';
import { punishmentModel } from '../../models/punishments';
import { Command } from '../../structures/Command';
import { PunishmentType } from '../../typings/PunishmentType';
import { generateManualId } from '../../utils/generatePunishmentId';
import ms from 'ms';
import { durationsModel } from '../../models/durations';
import { default_config } from '../../json/moderation.json';
import { sendModDM } from '../../utils/sendModDM';
import { interactions } from '../../interactions';

export default new Command({
	interaction: interactions.softban,
	excute: async ({ client, interaction, options }) => {
		const user = options.getUser('user');
		const member = options.getMember('user') as GuildMember;
		const reason = options.getString('reason') || default_config.reason;
		const delete_messages =
			options.getNumber('delete_messages') || default_config.ban_delete_messages;
		const duration = options.getString('duration') || default_config.softban_duration;

		if (member) if (getsIgnored(interaction, member)) return;
		if (ms(duration) === undefined)
			return interaction.reply({
				embeds: [
					client.embeds.error(
						'The provided duration must be in `1y, 8w, 1w, 1h, 1m` format.'
					),
				],
				ephemeral: true,
			});
		if (ms(duration) > 1000 * 60 * 60 * 24 * 365 || ms(duration) < 60000)
			return interaction.reply({
				embeds: [
					client.embeds.attention(
						'The duration must be between 1 minute and 1 year.'
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
			expire: new Date(punishmentExpiry.getTime() + ms(duration)),
		});
		await data.save();

		if (member)
			await sendModDM(member, {
				action: PunishmentType.Softban,
				punishment: data,
				expire: new Date(ms(duration)),
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
			endsAt: ms(duration),
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
			duration: ms(duration),
			moderator: interaction.user,
			reason: reason,
		});
	},
});

