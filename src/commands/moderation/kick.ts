import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import { getModCase } from '../../functions/cases/modCase';
import { manualWarningExpiry } from '../../constants';
import { getsIgnored } from '../../functions/getsIgnored';
import { createModLog } from '../../functions/logs/createModLog';
import { punishmentModel } from '../../models/punishments';
import { Command } from '../../structures/Command';
import { PunishmentType } from '../../typings/PunishmentType';
import { generateManualId } from '../../utils/generatePunishmentId';

export default new Command({
	name: 'kick',
	description: 'Kicks a member from the server.',
	directory: 'moderation',
	cooldown: 300,
	permission: ['KickMembers'],
	options: [
		{
			name: 'member',
			description: 'The member you wish to kick.',
			type: ApplicationCommandOptionType['User'],
			required: true,
		},
		{
			name: 'reason',
			description: 'The reason of this kick.',
			type: ApplicationCommandOptionType['String'],
			required: false,
			autocomplete: true,
		},
	],

	excute: async ({ client, interaction, options }) => {
		const member = options.getMember('member') as GuildMember;
		const reason = options.getString('reason') || 'No reason provided.';

		if (getsIgnored(interaction, member)) return;

		const data = new punishmentModel({
			_id: generateManualId(),
			case: await getModCase(),
			type: PunishmentType.Kick,
			userId: member.id,
			moderatorId: interaction.user.id,
			reason: reason,
			timestamp: Date.now(),
			expires: manualWarningExpiry,
		});
		await data.save();

		const DMembed = client.util
			.embed()
			.setAuthor({
				name: client.user.username,
				iconURL: client.user.displayAvatarURL(),
			})
			.setTitle('You were kicked from ' + interaction.guild.name)
			.setColor(client.colors.moderation)
			.addFields(
				{
					name: 'Punishment Id',
					value: data._id,
					inline: true,
				},
				{
					name: 'Reason',
					value: reason,
					inline: false,
				}
			);
		await member.send({ embeds: [DMembed] }).catch(() => {});
		await member.kick(reason);

		await interaction.reply({
			embeds: [client.embeds.success(`**${member.displayName}** was kicked!`)],
			ephemeral: true,
		});
		var actionMessage = await interaction.channel.send({
			embeds: [
				client.embeds.moderation(member.user, {
					action: PunishmentType.Kick,
					id: data._id,
				}),
			],
		});

		await createModLog(interaction, {
			action: PunishmentType.Kick,
			punishmentId: data._id,
			user: member.user,
			moderator: interaction.user,
			reason: reason,
			actionMessage: actionMessage,
		});
	},
});
