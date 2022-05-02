import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import { getModCase } from '../../functions/cases/modCase';
import { banSystemExpiry } from '../../constants';
import { getsIgnored } from '../../functions/getsIgnored';
import { createModLog } from '../../functions/logs/createModLog';
import { punishmentModel } from '../../models/punishments';
import { Command } from '../../structures/Command';
import { PunishmentType } from '../../typings/PunishmentType';
import { generateManualId } from '../../utils/generatePunishmentId';

export default new Command({
	name: 'ban',
	description: 'Bans a member from the server.',
	directory: 'moderation',
	cooldown: 3000,
	permission: ['BanMembers'],
	options: [
		{
			name: 'member',
			description: 'The member you wish to ban.',
			type: ApplicationCommandOptionType.User,
			required: true,
		},
		{
			name: 'reason',
			description: 'The reason of the ban.',
			type: ApplicationCommandOptionType.String,
			required: false,
			autocomplete: true,
		},
	],

	excute: async ({ client, interaction, options }) => {
		const member = options.getMember('member') as GuildMember;
		const reason = options.getString('reason') || 'No reason was provided.';

		if (getsIgnored(interaction, member)) return;

		const data = new punishmentModel({
			_id: generateManualId(),
			case: await getModCase(),
			type: PunishmentType.Ban,
			userId: member.id,
			moderatorId: interaction.user.id,
			reason: reason,
			timestamp: Date.now(),
			expires: banSystemExpiry,
		});
		await data.save();

		const DMembed = client.util
			.embed()
			.setAuthor({
				name: client.user.username,
				iconURL: client.user.displayAvatarURL(),
			})
			.setTitle('You were banned from ' + interaction.guild.name)
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
		await member.ban({ reason: reason });

		await interaction.reply({
			embeds: [client.embeds.success(`**${member.displayName}** was banned!`)],
			ephemeral: true,
		});
		var actionMessage = await interaction.channel.send({
			embeds: [
				client.embeds.moderation(member.user, {
					action: PunishmentType.Ban,
					id: data._id,
				}),
			],
		});

		await createModLog(interaction, {
			action: PunishmentType.Ban,
			punishmentId: data._id,
			user: member.user,
			moderator: interaction.user,
			reason: reason,
			actionMessage: actionMessage,
		});
	},
});
