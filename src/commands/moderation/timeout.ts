import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import { Command } from '../../structures/Command';
import ms from 'ms';
import { punishmentModel } from '../../models/punishments';
import { warningExpiry } from '../../constants';
import { durationsModel } from '../../models/durations';
import { PunishmentType } from '../../typings/PunishmentType';
import { generateManualId } from '../../utils/generatePunishmentId';
import { getModCase } from '../../functions/cases/modCase';
import { createModLog } from '../../functions/logs/createModLog';
import { timeoutMember } from '../../utils/timeoutMember';
import { getsIgnored } from '../../functions/getsIgnored';
import { default_config } from '../../json/moderation.json';
import { sendModDM } from '../../utils/sendModDM';

export default new Command({
	name: 'timeout',
	description: 'Times out a member in the server.',
	directory: 'moderation',
	cooldown: 3000,
	permission: ['ModerateMembers'],
	options: [
		{
			name: 'member',
			description: 'The member you wish to timeout.',
			type: ApplicationCommandOptionType['User'],
			required: true,
		},
		{
			name: 'duration',
			description: 'The duration of this timeout.',
			type: ApplicationCommandOptionType['String'],
			required: false,
		},
		{
			name: 'reason',
			description: 'The reason of this timeout.',
			type: ApplicationCommandOptionType['String'],
			required: false,
			autocomplete: true,
		},
	],

	excute: async ({ client, interaction, options }) => {
		const member = options.getMember('member') as GuildMember;
		const duration = options.getString('duration') || default_config.timeout_duration;
		const reason = options.getString('reason');

		if (getsIgnored(interaction, member)) return;
		if (member.permissions.has('Administrator'))
			return interaction.reply({
				embeds: [client.embeds.error("Administrators can't be timed out.")],
				ephemeral: true,
			});

		// Trying to guess if the mod is tryin to unmute
		if (
			['off', 'end', 'expire', 'null', '0', 'zero', 'remove'].includes(
				duration.toLowerCase()
			)
		)
			return interaction.reply({
				embeds: [
					client.embeds.attention(
						"If you're trying to unmute a member, try using `/punishment revoke`"
					),
				],
				ephemeral: true,
			});
		if (await durationsModel.findOne({ userId: member.id }))
			return interaction.reply({
				embeds: [client.embeds.error('This member is already timed out.')],
				ephemeral: true,
			});
		if (ms(duration) === undefined)
			return interaction.reply({
				embeds: [
					client.embeds.error(
						'The provided duration must be in `1h, 1m, 1s` format.'
					),
				],
				ephemeral: true,
			});
		if (ms(duration) > 1000 * 60 * 60 * 24 * 27 || ms(duration) < 10000)
			return interaction.reply({
				embeds: [
					client.embeds.attention(
						'The duration must be between 10 seconds and 27 days.'
					),
				],
				ephemeral: true,
			});

		await timeoutMember(member, { duration: ms(duration), reason: reason });

		const data = new punishmentModel({
			_id: generateManualId(),
			case: await getModCase(),
			type: PunishmentType.Timeout,
			userId: member.id,
			moderatorId: interaction.user.id,
			reason: reason,
			date: new Date(),
			expire: new Date(warningExpiry.getTime() + ms(duration)),
		});
		await data.save();

		await interaction.reply({
			embeds: [
				client.embeds.moderation(member.user, {
					action: PunishmentType.Timeout,
					id: data._id,
				}),
			],
			ephemeral: true,
		});

		await sendModDM(member, {
			action: PunishmentType.Timeout,
			punishment: data,
			expire: new Date(Date.now() + ms(duration)),
		});

		await createModLog({
			action: PunishmentType.Timeout,
			punishmentId: data._id,
			duration: ms(duration),
			user: member.user,
			moderator: interaction.user,
			reason: reason,
		});
	},
});
