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
	interaction: interactions.ban,
	excute: async ({ client, interaction, options }) => {
		const user = options.getUser('user');
		const member = options.getMember('user') as GuildMember;
		const reason = options.getString('reason') ?? t('common.noReason');
		const delete_messages = options.getNumber('delete_messages') ?? client.config.moderation.defaults.msgs;

		if (member) if (ignore(member, { interaction, action: PunishmentTypes.Ban })) return;
		if (await interaction.guild.bans.fetch(user.id).catch(() => {}))
			return interaction.reply({
				embeds: [client.embeds.error(t('command.mod.ban.banned'))],
				ephemeral: true,
			});

		await confirm(interaction, {
			confirmMessage: t('command.mod.ban.confirm', { user: user.tag }),
			ephemeral: true,
			callback: async () => {
				const data = await new punishmentModel({
					_id: await generateManualId(),
					case: await getModCase(),
					type: PunishmentTypes.Ban,
					userId: user.id,
					moderatorId: interaction.user.id,
					reason: reason,
					date: new Date(),
					expire: punishmentExpiry,
				}).save();

				if (member)
					await sendModDM(member, {
						action: PunishmentTypes.Ban,
						punishment: data,
					});

				await interaction.guild.members.ban(user, {
					deleteMessageDays: delete_messages,
					reason: reason,
				});

				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setDescription(
								t('common.modEmbed', {
									user: member ? user.toString() : user.tag,
									action: t('command.mod.ban.past'),
									id: data._id,
								})
							)
							.setColor(client.cc.moderation),
					],
					components: [],
				});

				await createModLog({
					action: PunishmentTypes.Ban,
					punishmentId: data._id,
					user: user,
					moderator: interaction.user,
					reason: reason,
					expire: punishmentExpiry,
				});
			},
		});
	},
});
