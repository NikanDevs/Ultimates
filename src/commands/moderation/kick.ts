import { EmbedBuilder, GuildMember } from 'discord.js';
import { getModCase } from '../../functions/cases/modCase';
import { punishmentExpiry } from '../../constants';
import { ignore } from '../../functions/ignore';
import { createModLog } from '../../functions/logs/createModLog';
import { punishmentModel } from '../../models/punishments';
import { Command } from '../../structures/Command';
import { PunishmentTypes } from '../../typings';
import { generateManualId } from '../../utils/generatePunishmentId';
import { sendModDM } from '../../utils/sendModDM';
import { interactions } from '../../interactions';
import { t } from 'i18next';
import { confirm } from '../../utils/sendConfirmation';

export default new Command({
	interaction: interactions.kick,
	excute: async ({ client, interaction, options }) => {
		const member = options.getMember('member') as GuildMember;
		const reason = options.getString('reason') ?? t('common.noReason');

		if (!member)
			return interaction.reply({
				embeds: [client.embeds.error(t('common.errors.invalidMember'))],
				ephemeral: true,
			});

		if (ignore(member, { interaction, action: PunishmentTypes.Kick })) return;

		await confirm(interaction, {
			confirmMessage: t('command.mod.kick.confirm', { user: member.user.tag }),
			ephemeral: true,
			callback: async () => {
				const data = await new punishmentModel({
					_id: await generateManualId(),
					case: await getModCase(),
					type: PunishmentTypes.Kick,
					userId: member.id,
					moderatorId: interaction.user.id,
					reason: reason,
					date: new Date(),
					expire: punishmentExpiry,
				}).save();

				await sendModDM(member, {
					action: PunishmentTypes.Kick,
					punishment: data,
				});
				await member.kick(reason);

				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setDescription(
								t('common.modEmbed', {
									user: member,
									action: t('command.mod.kick.past'),
									id: data._id,
								})
							)
							.setColor(client.cc.moderation),
					],
					components: [],
				});

				await createModLog({
					action: PunishmentTypes.Kick,
					punishmentId: data._id,
					user: member.user,
					moderator: interaction.user,
					reason: reason,
					expire: punishmentExpiry,
				});
			},
		});
	},
});
