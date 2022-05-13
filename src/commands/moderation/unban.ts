import { ApplicationCommandOptionType } from 'discord.js';
import { getModCase } from '../../functions/cases/modCase';
import { punishmentExpiry } from '../../constants';
import { createModLog } from '../../functions/logs/createModLog';
import { punishmentModel } from '../../models/punishments';
import { Command } from '../../structures/Command';
import { PunishmentType } from '../../typings/PunishmentType';
import { generateManualId } from '../../utils/generatePunishmentId';

export default new Command({
	name: 'unban',
	description: 'Unbans a user that was previously banned.',
	directory: 'moderation',
	cooldown: 3000,
	permission: ['BanMembers'],
	options: [
		{
			name: 'user-id',
			description: 'The user you wish to unban.',
			type: ApplicationCommandOptionType.String,
			required: true,
			autocomplete: true,
		},
		{
			name: 'reason',
			description: 'The reason of the unban.',
			type: ApplicationCommandOptionType.String,
			required: false,
			autocomplete: true,
		},
	],

	excute: async ({ client, interaction, options }) => {
		const userId = options.getString('user-id');
		const reason = options.getString('reason') || 'No reason was provided.';

		const bannedMember = await interaction.guild.bans.fetch(userId).catch(() => {});
		if (!bannedMember)
			return interaction.reply({
				embeds: [
					client.embeds.error("I wasn't able to find a banned member with that ID."),
				],
				ephemeral: true,
			});

		await interaction.deferReply();
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

		await interaction.followUp({
			embeds: [
				client.embeds.moderation(`**${bannedMember.user.tag}**`, {
					action: PunishmentType.Unban,
					id: data._id,
				}),
			],
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
