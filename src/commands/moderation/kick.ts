import { GuildMember } from 'discord.js';
import { getModCase } from '../../functions/cases/modCase';
import { punishmentExpiry } from '../../constants';
import { ignore } from '../../functions/ignore';
import { createModLog } from '../../functions/logs/createModLog';
import { punishmentModel } from '../../models/punishments';
import { Command } from '../../structures/Command';
import { PunishmentType } from '../../typings/PunishmentType';
import { generateManualId } from '../../utils/generatePunishmentId';
import { sendModDM } from '../../utils/sendModDM';
import { default_config } from '../../json/moderation.json';
import { interactions } from '../../interactions';

export default new Command({
	interaction: interactions.kick,
	excute: async ({ client, interaction, options }) => {
		const member = options.getMember('member') as GuildMember;
		const reason = options.getString('reason') || default_config.reason;

		if (ignore(member, { interaction, action: PunishmentType.Kick })) return;

		const data = new punishmentModel({
			_id: generateManualId(),
			case: await getModCase(),
			type: PunishmentType.Kick,
			userId: member.id,
			moderatorId: interaction.user.id,
			reason: reason,
			date: new Date(),
			expire: punishmentExpiry,
		});
		await data.save();

		await sendModDM(member, {
			action: PunishmentType.Kick,
			punishment: data,
		});
		await member.kick(reason);

		await interaction.reply({
			embeds: [
				client.embeds.moderation(member.user, {
					action: PunishmentType.Kick,
					id: data._id,
				}),
			],
			ephemeral: true,
		});

		await createModLog({
			action: PunishmentType.Kick,
			punishmentId: data._id,
			user: member.user,
			moderator: interaction.user,
			reason: reason,
			expire: punishmentExpiry,
		});
	},
});
