import { getModCase } from '../../functions/cases/modCase';
import { punishmentExpiry } from '../../constants';
import { createModLog } from '../../functions/logs/createModLog';
import { punishmentModel } from '../../models/punishments';
import { Command } from '../../structures/Command';
import { PunishmentTypes } from '../../typings';
import { generateManualId } from '../../utils/generatePunishmentId';
import { interactions } from '../../interactions';
import { t } from 'i18next';
import { EmbedBuilder } from 'discord.js';
import { confirm } from '../../utils/sendConfirmation';

export default new Command({
	interaction: interactions.unban,
	excute: async ({ client, interaction, options }) => {
		const userId = options.getString('user');
		const reason = options.getString('reason') ?? t('common.noReason');

		const bannedMember = await interaction.guild.bans.fetch(userId).catch(() => {});
		if (!bannedMember)
			return interaction.reply({
				embeds: [
					client.embeds.error(t('command.mod.unban.none') + ' ' + t('common.errors.useAutocomplete')),
				],
				ephemeral: true,
			});

		await confirm(interaction, {
			confirmMessage: t('command.mod.unban.confirm', { user: bannedMember.user.tag }),
			ephemeral: true,
			callback: async () => {
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

				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setDescription(
								t('common.modEmbed', {
									user: bannedMember.user.tag,
									action: t('command.mod.unban.past'),
									id: data._id,
								})
							)
							.setColor(client.cc.moderation),
					],
					components: [],
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
	},
});
