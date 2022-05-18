import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import { getModCase } from '../../functions/cases/modCase';
import { punishmentExpiry } from '../../constants';
import { getsIgnored } from '../../functions/getsIgnored';
import { createModLog } from '../../functions/logs/createModLog';
import { punishmentModel } from '../../models/punishments';
import { Command } from '../../structures/Command';
import { PunishmentType } from '../../typings/PunishmentType';
import { generateManualId } from '../../utils/generatePunishmentId';
import ms from 'ms';
import { durationsModel } from '../../models/durations';
import { default_config } from '../../json/moderation.json';
import { sendModDM } from '../../utils/sendModDM';

export default new Command({
	name: 'softban',
	description: 'Softbans a member from the server.',
	directory: 'moderation',
	cooldown: 3000,
	permission: ['BanMembers'],
	options: [
		{
			name: 'member',
			description: 'The member you wish to softban.',
			type: ApplicationCommandOptionType.User,
			required: true,
		},
		{
			name: 'duration',
			description: 'The duration you want the member to be banned for.',
			type: ApplicationCommandOptionType.String,
			required: false,
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
			description: 'The reason of the softban.',
			type: ApplicationCommandOptionType.String,
			required: false,
			autocomplete: true,
		},
	],

	excute: async ({ client, interaction, options }) => {
		const member = options.getMember('member') as GuildMember;
		const reason = options.getString('reason') || 'No reason was provided.';
		const delete_messages =
			options.getNumber('delete_messages') || default_config.ban_delete_messages;
		const duration = options.getString('duration') || default_config.softban_duration;

		if (getsIgnored(interaction, member)) return;
		if (ms(duration) === undefined)
			return interaction.reply({
				embeds: [
					client.embeds.error(
						'The provided duration must be in `1h, 1m, 1s` format.'
					),
				],
				ephemeral: true,
			});
		if (ms(duration) > 1000 * 60 * 60 * 24 * 365 || ms(duration) < 10000)
			return interaction.reply({
				embeds: [
					client.embeds.attention(
						'The duration must be between 10 seconds and 1 year.'
					),
				],
				ephemeral: true,
			});

		const data = new punishmentModel({
			_id: generateManualId(),
			case: await getModCase(),
			type: PunishmentType.Softban,
			userId: member.id,
			moderatorId: interaction.user.id,
			reason: reason,
			date: new Date(),
			expire: new Date(punishmentExpiry.getTime() + ms(duration)),
		});
		await data.save();

		await sendModDM(member, {
			action: PunishmentType.Softban,
			punishment: data,
			expire: new Date(ms(duration)),
		});
		await member.ban({ reason: reason, deleteMessageDays: delete_messages });

		const durationData = new durationsModel({
			case: await getModCase(),
			type: PunishmentType.Softban,
			userId: member.user.id,
			endsAt: new Date(Date.now() + ms(duration)),
		});
		await durationData.save();

		await interaction.reply({
			embeds: [
				client.embeds.moderation(member.user, {
					action: PunishmentType.Softban,
					id: data._id,
				}),
			],
			ephemeral: true,
		});

		await createModLog({
			action: PunishmentType.Softban,
			punishmentId: data._id,
			user: member.user,
			duration: ms(duration),
			moderator: interaction.user,
			reason: reason,
		});
	},
});

