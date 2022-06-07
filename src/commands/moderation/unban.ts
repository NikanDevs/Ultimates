import { getModCase } from '../../functions/cases/modCase';
import { punishmentExpiry } from '../../constants';
import { createModLog } from '../../functions/logs/createModLog';
import { punishmentModel } from '../../models/punishments';
import { Command } from '../../structures/Command';
import { PunishmentType } from '../../typings/PunishmentType';
import { generateManualId } from '../../utils/generatePunishmentId';
import { interactions } from '../../interactions';

export default new Command({
	interaction: interactions.unban,
	excute: async ({ client, interaction, options }) => {
		const userId = options.getString('user');
		const reason = options.getString('reason') || client.config.moderation.default.reason;

		const bannedMember = await interaction.guild.bans.fetch(userId).catch(() => {});
		if (!bannedMember)
			return interaction.reply({
				embeds: [
					client.embeds.error("I wasn't able to find a banned member with that ID."),
				],
				ephemeral: true,
			});

		const data = new punishmentModel({
			_id: generateManualId(),
			case: await getModCase(),
			type: PunishmentType.Unban,
			userId: userId,
			moderatorId: interaction.user.id,
			reason: reason,
			date: new Date(),
			expire: punishmentExpiry,
		});
		await data.save();

		await interaction.guild.bans.remove(userId);
		await interaction.reply({
			embeds: [
				client.embeds.moderation(`**${bannedMember.user.tag}**`, {
					action: PunishmentType.Unban,
					id: data._id,
				}),
			],
			ephemeral: true,
		});

		await createModLog({
			action: PunishmentType.Unban,
			punishmentId: data._id,
			user: bannedMember.user,
			moderator: interaction.user,
			reason: reason,
			expire: punishmentExpiry,
		});
	},
});
