import { getModCase } from '../../functions/cases/modCase';
import { punishmentExpiry } from '../../constants';
import { createModLog } from '../../functions/logs/createModLog';
import { punishmentModel } from '../../models/punishments';
import { Command } from '../../structures/Command';
import { PunishmentTypes } from '../../typings';
import { generateManualId } from '../../utils/generatePunishmentId';
import { interactions } from '../../interactions';
import { t } from 'i18next';

export default new Command({
	interaction: interactions.unban,
	excute: async ({ client, interaction, options }) => {
		const userId = options.getString('user');
		const reason = options.getString('reason') ?? t('common.noReason');

		const bannedMember = await interaction.guild.bans.fetch(userId).catch(() => {});
		if (!bannedMember)
			return interaction.reply({
				embeds: [
					client.embeds.error(
						"I couldn't find that banned member. " + t('common.errors.userAutocomplete')
					),
				],
				ephemeral: true,
			});

		await interaction.guild.bans.remove(userId);
		if (bannedMember.user.bot)
			return interaction.reply({
				embeds: [client.embeds.success(`**${bannedMember.user.tag}** was unbanned.`)],
				ephemeral: true,
			});

		const data = new punishmentModel({
			_id: await generateManualId(),
			case: await getModCase(),
			type: PunishmentTypes.Unban,
			userId: userId,
			moderatorId: interaction.user.id,
			reason: reason,
			date: new Date(),
			expire: punishmentExpiry,
		});
		await data.save();

		await interaction.reply({
			embeds: [
				client.embeds.moderation(`**${bannedMember.user.tag}**`, {
					action: PunishmentTypes.Unban,
					id: data._id,
				}),
			],
			ephemeral: true,
		});

		await createModLog({
			action: PunishmentTypes.Unban,
			punishmentId: data._id,
			user: bannedMember.user,
			moderator: interaction.user,
			reason: reason,
			expire: punishmentExpiry,
		});
	},
});
