import { EmbedBuilder, GuildMember } from 'discord.js';
import { getModCase } from '../../functions/cases/modCase';
import { MAX_SOFTBAN_DURATION, MIN_SOFTBAN_DURATION, punishmentExpiry } from '../../constants';
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
import { t } from 'i18next';
import { confirm } from '../../utils/sendConfirmation';

export default new Command({
	interaction: interactions.softban,
	excute: async ({ client, interaction, options }) => {
		const user = options.getUser('user');
		const member = options.getMember('user') as GuildMember;
		const reason = options.getString('reason') ?? t('common.noReason');
		const delete_messages = options.getNumber('delete_messages') ?? client.config.moderation.defaults.msgs;
		const durationO = options.getString('duration') ?? client.config.moderation.defaults.softban;
		const duration = convertToTime(durationO);

		if (member) if (ignore(member, { interaction, action: PunishmentTypes.Softban })) return;
		if (await interaction.guild.bans.fetch(user.id).catch(() => {}))
			return interaction.reply({
				embeds: [client.embeds.error(t('command.mod.softban.banned'))],
				ephemeral: true,
			});

		if (!isValidTime(durationO))
			return interaction.reply({
				embeds: [client.embeds.error(t('common.$errors.invalidDuration'))],
				ephemeral: true,
			});
		if (duration > MAX_SOFTBAN_DURATION || duration < MIN_SOFTBAN_DURATION)
			return interaction.reply({
				embeds: [
					client.embeds.attention(
						t('common.errors.duration', {
							min: convertTime(MIN_SOFTBAN_DURATION),
							max: convertTime(MAX_SOFTBAN_DURATION),
						})
					),
				],
				ephemeral: true,
			});

		await confirm(interaction, {
			confirmMessage: t('command.mod.softban.confirm', { user: user.tag, duration: convertTime(duration) }),
			ephemeral: true,
			callback: async () => {
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
					reason,
				});

				const durationData = new durationsModel({
					case: await getModCase(),
					type: PunishmentTypes.Softban,
					userId: user.id,
					expires: new Date(Date.now() + duration),
				});
				await durationData.save();

				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setDescription(
								t('common.modEmbed', {
									user: member ? user.toString() : user.tag,
									action: t('command.mod.softban.past'),
									id: data._id,
								})
							)
							.setColor(client.cc.moderation),
					],
					components: [],
				});

				await createModLog({
					action: PunishmentTypes.Softban,
					punishmentId: data._id,
					user: user,
					duration: duration,
					moderator: interaction.user,
					reason: reason,
					expire: new Date(punishmentExpiry.getTime() + duration),
				});
			},
		});
	},
});
