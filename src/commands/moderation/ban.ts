import { EmbedBuilder, GuildMember } from 'discord.js';
import { getModCase } from '../../functions/cases/modCase';
import { punishmentExpiry } from '../../constants';
import { ignore } from '../../functions/ignore';
import { createModLog } from '../../functions/logs/createModLog';
import { punishmentModel } from '../../models/punishments';
import { Command } from '../../structures/Command';
import { PunishmentType } from '../../typings/PunishmentType';
import { generateManualId } from '../../utils/generatePunishmentId';
import { default_config } from '../../json/moderation.json';
import { sendModDM } from '../../utils/sendModDM';
import { interactions } from '../../interactions';

export default new Command({
	interaction: interactions.ban,
	excute: async ({ client, interaction, options }) => {
		const user = options.getUser('user');
		const member = options.getMember('user') as GuildMember;
		const reason = options.getString('reason') || default_config.reason;
		const delete_messages =
			options.getNumber('delete_messages') || default_config.ban_delete_messages;

		if (member) if (ignore(member, { interaction, action: PunishmentType.Ban })) return;
		if (await interaction.guild.bans.fetch(user.id).catch(() => {}))
			return interaction.reply({
				embeds: [client.embeds.error('This user is already banned from the server.')],
				ephemeral: true,
			});

		const data = new punishmentModel({
			_id: generateManualId(),
			case: await getModCase(),
			type: PunishmentType.Ban,
			userId: user.id,
			moderatorId: interaction.user.id,
			reason: reason,
			date: new Date(),
			expire: punishmentExpiry,
		});
		await data.save();

		if (member)
			await sendModDM(member, {
				action: PunishmentType.Ban,
				punishment: data,
			});
		await interaction.guild.members.ban(user, {
			deleteMessageDays: delete_messages,
			reason: reason,
		});

		await interaction.reply({
			embeds: [
				client.embeds.moderation(member ? user : user.tag, {
					action: PunishmentType.Ban,
					id: data._id,
				}),
			],
			ephemeral: true,
		});

		await createModLog({
			action: PunishmentType.Ban,
			punishmentId: data._id,
			user: user,
			moderator: interaction.user,
			reason: reason,
			expire: punishmentExpiry,
		});
	},
});
