import { ApplicationCommandOptionType, ButtonStyle, GuildMember } from 'discord.js';
import { getModCase } from '../../functions/cases/modCase';
import { punishmentExpiry, warningExpiry } from '../../constants';
import { getsIgnored } from '../../functions/getsIgnored';
import { createModLog } from '../../functions/logs/createModLog';
import { punishmentModel } from '../../models/punishments';
import { Command } from '../../structures/Command';
import { PunishmentType } from '../../typings/PunishmentType';
import { generateManualId } from '../../utils/generatePunishmentId';
import { timeoutMember } from '../../utils/timeoutMember';
import { generateDiscordTimestamp } from '../../utils/generateDiscordTimestamp';
enum reasons {
	'two' = 'Reaching 2 manual warnings.',
	'four' = 'Reaching 4 manual warnings.',
	'six' = 'Reaching 6 manual warnings.',
}
enum durations {
	'two' = 1000 * 60 * 60 * 2,
	'four' = 1000 * 10 * 60 * 6,
}

export default new Command({
	name: 'warn',
	description: 'Warns a member.',
	directory: 'moderation',
	cooldown: 3000,
	permission: ['ManageMessages'],
	options: [
		{
			name: 'member',
			description: 'The member you wish to warn.',
			type: ApplicationCommandOptionType['User'],
			required: true,
		},
		{
			name: 'reason',
			description: 'The reason for your warning.',
			type: ApplicationCommandOptionType['String'],
			required: true,
			autocomplete: true,
		},
	],

	excute: async ({ client, interaction, options }) => {
		const member = options.getMember('member') as GuildMember;
		const reason = options.getString('reason');

		if (getsIgnored(interaction, member)) return;

		const warnData = new punishmentModel({
			_id: generateManualId(),
			case: await getModCase(),
			type: PunishmentType.Warn,
			userId: member.id,
			moderatorId: interaction.user.id,
			reason: reason,
			date: new Date(),
			expire: warningExpiry,
		});
		await warnData.save();

		interaction.reply({
			embeds: [
				client.embeds.moderation(member.user, {
					action: PunishmentType.Warn,
					id: warnData._id,
				}),
			],
			ephemeral: true,
		});

		const dmEmbed = client.util
			.embed()
			.setAuthor({
				name: client.user.username,
				iconURL: client.user.displayAvatarURL(),
			})
			.setTitle('You were warned in ' + interaction.guild.name)
			.setColor(client.colors.moderation)
			.addFields(
				{
					name: 'Punishment Id',
					value: warnData._id,
					inline: true,
				},
				{
					name: 'Expiry',
					value: `${generateDiscordTimestamp(warnData.expire)}`,
					inline: true,
				},
				{
					name: 'Reason',
					value: reason,
					inline: false,
				}
			);
		await member.send({ embeds: [dmEmbed] }).catch(() => {});

		await createModLog({
			action: PunishmentType.Warn,
			punishmentId: warnData._id,
			user: member.user,
			moderator: interaction.user,
			reason: reason,
			expire: warningExpiry,
		}).then(async () => {
			// ------------------------------------- checking for auto action on warn counts --------------------------------

			const findWarnings = await punishmentModel.find({
				userId: member.id,
				type: PunishmentType.Warn,
			});
			const warningsCount = findWarnings.length;

			switch (warningsCount) {
				case 2:
					await timeoutMember(member, {
						duration: durations['two'],
						reason: reasons['two'],
					});

					const data = new punishmentModel({
						_id: generateManualId(),
						case: await getModCase(),
						type: PunishmentType.Timeout,
						userId: member.id,
						moderatorId: client.user.id,
						reason: reasons['two'],
						date: new Date(),
						expire: warningExpiry,
					});
					data.save();

					await createModLog({
						action: PunishmentType.Timeout,
						punishmentId: data._id,
						user: member.user,
						moderator: client.user,
						reason: reasons['two'],
						duration: durations['two'],
						referencedPunishment: warnData,
						expire: warningExpiry,
					});

					const DMembed = client.util
						.embed()
						.setAuthor({
							name: client.user.username,
							iconURL: client.user.displayAvatarURL(),
						})
						.setColor(client.colors.moderation)
						.setTitle(`You were timed out in ${interaction.guild.name}`)
						.addFields(
							{
								name: 'Type',
								value: 'Automatic',
								inline: true,
							},
							{
								name: 'Duration',
								value: client.util.convertTime(durations['two'] / 1000),
								inline: true,
							},
							{
								name: 'Reason',
								value: reasons['two'],
								inline: false,
							}
						);
					await member.send({ embeds: [DMembed] }).catch(() => {});

					break;
				case 4:
					await timeoutMember(member, {
						duration: durations['four'],
						reason: reasons['four'],
					});

					const data2 = new punishmentModel({
						_id: generateManualId(),
						case: await getModCase(),
						type: PunishmentType.Timeout,
						userId: member.id,
						moderatorId: client.user.id,
						reason: reasons['four'],
						date: new Date(),
						expire: warningExpiry,
					});
					data2.save();

					await createModLog({
						action: PunishmentType.Timeout,
						punishmentId: data2._id,
						user: member.user,
						moderator: client.user,
						reason: reasons['four'],
						duration: durations['four'],
						referencedPunishment: warnData,
						expire: warningExpiry,
					});

					const DMembed2 = client.util
						.embed()
						.setAuthor({
							name: client.user.username,
							iconURL: client.user.displayAvatarURL(),
						})
						.setColor(client.colors.moderation)
						.setTitle(`You were timed out in ${interaction.guild.name}`)
						.addFields(
							{
								name: 'Type',
								value: 'Automatic',
								inline: true,
							},
							{
								name: 'Duration',
								value: client.util.convertTime(durations['two'] / 1000),
								inline: true,
							},
							{
								name: 'Reason',
								value: reasons['four'],
								inline: false,
							}
						);
					await member.send({ embeds: [DMembed2] }).catch(() => {});

					break;
				case 6:
					const data3 = new punishmentModel({
						_id: generateManualId(),
						case: await getModCase(),
						type: PunishmentType.Ban,
						userId: member.id,
						moderatorId: client.user.id,
						reason: reasons['six'],
						date: new Date(),
						expire: punishmentExpiry,
					});
					data3.save();

					await createModLog({
						action: PunishmentType.Ban,
						punishmentId: data3._id,
						user: member.user,
						moderator: client.user,
						reason: reasons['six'],
						referencedPunishment: warnData,
						expire: punishmentExpiry,
					});

					const DMembed3 = client.util
						.embed()
						.setAuthor({
							name: client.user.username,
							iconURL: client.user.displayAvatarURL(),
						})
						.setColor(client.colors.moderation)
						.setTitle(`You were banned from ${interaction.guild.name}`)
						.addFields(
							{
								name: 'Punishment ID',
								value: `${data3._id}`,
								inline: true,
							},
							{
								name: 'Reason',
								value: reasons['six'],
								inline: false,
							}
						);
					const appealButton = client.util
						.actionRow()
						.addComponents(
							client.util
								.button()
								.setURL(client.server.appeal)
								.setStyle(ButtonStyle['Link'])
								.setLabel('Appeal')
						);

					await member
						.send({ embeds: [DMembed3], components: [appealButton] })
						.catch(() => {});
					await member.ban({ reason: reasons['six'] });
					break;
			}
		});
	},
});
