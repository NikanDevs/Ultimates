import { Command } from '../../structures/Command';
import { interactions } from '../../interactions';
import { convertTime, convertToTime, isValidTime } from '../../functions/convertTime';
import { t } from 'i18next';
import {
	MAX_ANTIRAID_DURATION,
	MAX_REASON_LENGTH,
	MIN_ANTIRAID_DURATION,
	punishmentExpiry,
} from '../../constants';
import { PunishmentTypes } from '../../typings';
import { punishmentModel } from '../../models/punishments';
import { generateManualId } from '../../utils/generatePunishmentId';
import { getModCase } from '../../functions/cases/modCase';
import { splitText } from '../../functions/other/splitText';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Colors,
	ComponentType,
	EmbedBuilder,
	Message,
} from 'discord.js';
import { generateDiscordTimestamp } from '../../utils/generateDiscordTimestamp';
import { createAntiraidLog } from '../../functions/logs/createAntiraidLog';
import { create } from 'sourcebin';
import { sendModDM } from '../../utils/sendModDM';

export default new Command({
	interaction: interactions.antiraid,
	excute: async ({ client, interaction, options }) => {
		const registeredOption = options.getString('registered');
		const joinedOption = options.getString('registered');
		const registered = convertToTime(registeredOption);
		const joined = convertToTime(joinedOption);
		const delete_messages =
			options.getNumber('delete_messages') ?? client.config.moderation.default.msgs;
		const reason =
			splitText(options.getString('reason'), MAX_REASON_LENGTH) ?? t('common.noReason');

		if (!isValidTime(registeredOption) || !isValidTime(joinedOption))
			return interaction.reply({
				embeds: [client.embeds.error(t('common.$errors.invalidDuration'))],
				ephemeral: true,
			});

		if (
			registered < MIN_ANTIRAID_DURATION ||
			joined < MIN_ANTIRAID_DURATION ||
			registered > MAX_ANTIRAID_DURATION ||
			joined > MAX_ANTIRAID_DURATION
		)
			return interaction.reply({
				embeds: [
					client.embeds.error(
						t('common.errors.duration', {
							min: convertTime(MIN_ANTIRAID_DURATION),
							max: convertTime(MAX_ANTIRAID_DURATION),
						})
					),
				],
				ephemeral: true,
			});

		await interaction.deferReply({ ephemeral: false });
		const members = await interaction.guild.members.fetch({ force: true });
		const filtered = members
			.filter(
				(m) =>
					!m.user.bot &&
					m.user.createdTimestamp! > Date.now() - registered &&
					m.joinedTimestamp! > Date.now() - joined
			)
			.map((m) => m);

		if (!filtered.length)
			return interaction.followUp({
				embeds: [client.embeds.attention('No members were affected by the antiraid.')],
			});

		const hitMembers = filtered.map((m) => `- ${m.user.tag} (${m.user.id})`);
		const confirmButtons = new ActionRowBuilder<ButtonBuilder>().addComponents([
			new ButtonBuilder()
				.setLabel('Confirm')
				.setCustomId('confirm')
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setLabel('Cancel')
				.setCustomId('cancel')
				.setStyle(ButtonStyle.Danger),
		]);

		const confirmMsg = (await interaction.followUp({
			content: `Do you confirm that these are the raiders?\n\`\`\`\n${splitText(
				hitMembers.join('\n'),
				4000 - 55
			)}\n\`\`\``,
			components: [confirmButtons],
		})) as Message;

		const collector = confirmMsg.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 30000,
		});

		collector.on('collect', async (c): Promise<any> => {
			if (c.user.id !== interaction.user.id)
				return c.reply({ content: t('common.errors.cannotInteract'), ephemeral: true });

			if (c.customId === 'cancel') return interaction.deleteReply();
			collector.stop('confirmed');

			interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setDescription(
							`The antiraid should be done ${generateDiscordTimestamp(
								new Date(Date.now() + filtered.length * 2000 + 5000)
							)}`
						)
						.setColor(Colors.Yellow),
				],
				components: [],
			});

			for (const raider of filtered) {
				setTimeout(async () => {
					await interaction.guild.members
						.ban(raider.user, { deleteMessageDays: delete_messages, reason })
						.catch(() => {});

					const data = new punishmentModel({
						_id: await generateManualId(),
						case: await getModCase(),
						type: PunishmentTypes.Ban,
						userId: raider.id,
						moderatorId: interaction.user.id,
						reason: reason,
						date: new Date(),
						expire: punishmentExpiry,
					});
					await data.save();

					sendModDM(raider, {
						action: PunishmentTypes.Ban,
						punishment: data,
						appeal: false,
					});
				}, 2000);
			}

			const results = await create(
				[
					{
						content: filtered.map((m) => `- ${m.user.tag} (${m.id})`).join('\n'),
					},
				],
				{
					title: `Antiraid results`,
					description: `The antiraid results for ${
						interaction.guild.name
					} at ${new Date().toLocaleDateString()}`,
				}
			);

			await createAntiraidLog({
				affected: filtered.length,
				moderator: interaction.user,
				reason: reason,
				registered,
				joined,
				results: results.url,
			});

			await interaction.editReply({
				embeds: [
					client.embeds.success(
						`Antiraid is done, ${filtered.length} member${
							filtered.length === 1 ? '' : 's'
						} affected.`
					),
				],
			});
		});

		collector.on('end', (_, reason) => {
			if (reason !== 'confirmed') return interaction.deleteReply();
		});
	},
});

