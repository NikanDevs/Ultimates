import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import { getModCase } from '../../functions/cases/modCase';
import { punishmentExpiry } from '../../constants';
import { getsIgnored } from '../../functions/getsIgnored';
import { createModLog } from '../../functions/logs/createModLog';
import { punishmentModel } from '../../models/punishments';
import { Command } from '../../structures/Command';
import { PunishmentType } from '../../typings/PunishmentType';
import { generateManualId } from '../../utils/generatePunishmentId';
import { default_config } from '../../json/moderation.json';
import { sendModDM } from '../../utils/sendModDM';

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
			name: 'delete_messages',
			description: 'The amount of days to delete messages for.',
			type: ApplicationCommandOptionType.Number,
			required: false,
			choices: [
				{ name: "Don't delete any", value: 0 },
				{ name: 'Previous 24 hours', value: 1 },
				{ name: 'Previous 48 hours', value: 2 },
				{ name: 'Previous 3 days', value: 3 },
				{ name: 'Previous 4 days', value: 4 },
				{ name: 'Previous 5 days', value: 5 },
				{ name: 'Previous 6 days', value: 6 },
				{ name: 'Previous 7 days', value: 7 },
			],
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
		const reason = options.getString('reason') || default_config.reason;
		const delete_messages =
			options.getNumber('delete_messages') || default_config.ban_delete_messages;

		if (getsIgnored(interaction, member)) return;

		const data = new punishmentModel({
			_id: generateManualId(),
			case: await getModCase(),
			type: PunishmentType.Ban,
			userId: member.id,
			moderatorId: interaction.user.id,
			reason: reason,
			date: new Date(),
			expire: punishmentExpiry,
		});
		await data.save();

		await sendModDM(member, {
			action: PunishmentType.Ban,
			punishment: data,
		});
		await member.ban({ reason: reason, deleteMessageDays: delete_messages });

		await interaction.reply({
			embeds: [
				client.embeds.moderation(member.user, {
					action: PunishmentType.Ban,
					id: data._id,
				}),
			],
			ephemeral: true,
		});

		await createModLog({
			action: PunishmentType.Ban,
			punishmentId: data._id,
			user: member.user,
			moderator: interaction.user,
			reason: reason,
			expire: punishmentExpiry,
		});
	},
});
