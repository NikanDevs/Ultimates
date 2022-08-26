import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Colors,
	ComponentType,
	EmbedBuilder,
	GuildMember,
	ModalBuilder,
	SelectMenuBuilder,
	TextInputStyle,
} from 'discord.js';
import { client } from '../..';
import { verificationCollection, VERIFICATION_TIME } from '../../constants';
import { Event } from '../../structures/Event';
import { convertTime } from '../../functions/convertTime';
import { VerificationModes } from '../../typings';
import { t } from 'i18next';
const characters = '0123456789';

export default new Event('interactionCreate', async (interaction) => {
	if (!interaction.isButton()) return;
	if (interaction.customId !== 'verify') return;

	// No member role
	if (!interaction.guild.roles.cache.get(client.config.general.memberRoleId))
		return interaction.reply({
			content: t('event.verification.noMemberRole'),
			ephemeral: true,
		});

	// Already verified
	if ((interaction.member as GuildMember).roles.cache.has(client.config.general.memberRoleId))
		return interaction.reply({
			content: t('event.verification.alreadyVerified'),
			ephemeral: true,
		});

	// Verificaton Cooldown
	const cooldownRemaining = `${~~(+verificationCollection.get(`cooldown:${interaction.user.id}`) - Date.now())}`;
	if (verificationCollection.has(`cooldown:${interaction.user.id}`))
		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setDescription(t('event.verification.cooldown', { time: convertTime(~~+cooldownRemaining) }))
					.setColor(Colors.Yellow),
			],
			ephemeral: true,
		});
	verificationCollection.set(`cooldown:${interaction.user.id}`, Date.now() + 30000);
	setTimeout(() => {
		verificationCollection.delete(`cooldown:${interaction.user.id}`);
	}, 30000);

	const verifiactionMode: number = generateRandomNumber(1, 3);

	switch (verifiactionMode) {
		case VerificationModes.Matching:
			{
				let key1 = generateCode();
				let key2 = generateRandomNumber(1, 2) === 1 ? key1 : generateCode();

				const embed = new EmbedBuilder()
					.setAuthor({ name: t('event.verification.matching.title') })
					.setDescription(t('event.verification.matching.description'))
					.addFields([
						{ name: t('event.verification.matching.key', { count: 1 }), value: key1, inline: true },
						{ name: t('event.verification.matching.key', { count: 2 }), value: key2, inline: true },
					])
					.setColor(client.cc.invisible);

				const buttonComponent = new ActionRowBuilder<ButtonBuilder>().addComponents([
					new ButtonBuilder()
						.setCustomId('verify-matching-yes')
						.setLabel('Matching')
						.setStyle(ButtonStyle.Success),
					new ButtonBuilder()
						.setCustomId('verify-matching-no')
						.setLabel('Not Matching')
						.setStyle(ButtonStyle.Danger),
				]);

				const msg = await interaction.reply({
					embeds: [embed],
					components: [buttonComponent],
					fetchReply: true,
					ephemeral: true,
				});

				// Collecting the answer
				const collector = msg.createMessageComponentCollector({
					time: VERIFICATION_TIME,
					componentType: ComponentType.Button,
					max: 1,
				});

				collector.on('collect', (collected) => {
					collector.stop('success');

					if (
						(key1 === key2 && collected.customId === 'verify-matching-yes') ||
						(key1 !== key2 && collected.customId === 'verify-matching-no')
					) {
						(interaction.member as GuildMember).roles.add(client.config.general.memberRoleId);

						interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(Colors.Green)
									.setDescription(t('event.verification.correct')),
							],
							components: [],
						});
						verificationCollection.delete(`cooldown:${interaction.user.id}`);
					} else {
						interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(Colors.Red)
									.setDescription(t('event.verification.incorrect')),
							],
							components: [],
						});
					}
				});

				collector.on('end', (_, reason) => {
					if (reason === 'success') return;

					interaction.editReply({
						embeds: [
							new EmbedBuilder()
								.setColor(Colors.Red)
								.setDescription(t('event.verification.timeout')),
						],
						components: [],
					});
				});
			}
			break;
		case VerificationModes.Modal:
			{
				let key = generateCode();

				const modal = new ModalBuilder()
					.setTitle(t('event.verification.modal.title', { key }))
					.setCustomId('verification:modal-' + interaction.user.id)
					.addComponents([
						{
							type: ComponentType.ActionRow,
							components: [
								{
									type: ComponentType.TextInput,
									custom_id: 'answer',
									label: t('event.verification.modal.label'),
									style: TextInputStyle.Short,
									required: true,
									max_length: 5,
									min_length: 5,
								},
							],
						},
					]);

				await interaction.showModal(modal);

				verificationCollection.set(`modal:${interaction.user.id}`, key);
				setTimeout(() => {
					if (!verificationCollection.get(`modal:${interaction.user.id}`)) return;

					interaction.followUp({
						embeds: [
							new EmbedBuilder()
								.setColor(Colors.Red)
								.setDescription(t('event.verification.timeout')),
						],
						ephemeral: true,
					});

					verificationCollection.delete(`modal:${interaction.user.id}`);
				}, VERIFICATION_TIME);
			}
			break;
		case VerificationModes.Selection:
			{
				let key = generateCode();

				const embed = new EmbedBuilder()
					.setAuthor({ name: t('event.verification.selection.title') })
					.setDescription(t('event.verification.selection.description', { key }))
					.setColor(client.cc.invisible);

				const options: string[] = [key];
				for (let index = 0; index < generateRandomNumber(4, 14); index++) {
					options.push(generateCode());
				}

				const buttonComponent = new ActionRowBuilder<SelectMenuBuilder>().addComponents([
					new SelectMenuBuilder()
						.setPlaceholder(t('event.verification.selection.selectMatching'))
						.setCustomId('verification:selection')
						.setMaxValues(1)
						.setMinValues(1)
						.setOptions(
							shuffleIndexes(
								options.map((i) => {
									return { label: i, value: i };
								})
							)
						),
				]);

				const msg = await interaction.reply({
					embeds: [embed],
					components: [buttonComponent],
					fetchReply: true,
					ephemeral: true,
				});

				const collector = msg.createMessageComponentCollector({
					time: VERIFICATION_TIME,
					componentType: ComponentType.SelectMenu,
					max: 1,
				});

				collector.on('collect', (collected) => {
					collector.stop('success');

					if (collected.values[0] === key) {
						(interaction.member as GuildMember).roles.add(client.config.general.memberRoleId);

						interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(Colors.Green)
									.setDescription(t('event.verification.correct')),
							],
							components: [],
						});
						verificationCollection.delete(`cooldown:${interaction.user.id}`);
					} else {
						interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(Colors.Red)
									.setDescription(t('event.verification.incorrect')),
							],
							components: [],
						});
					}
				});

				collector.on('end', (_, reason) => {
					if (reason === 'success') return;

					interaction.editReply({
						embeds: [
							new EmbedBuilder()
								.setColor(Colors.Red)
								.setDescription(t('event.verification.timeout')),
						],
						components: [],
					});
				});
			}
			break;
	}
});

function generateCode() {
	let code = '';
	for (var i = 0; i < 5; i++) {
		code += characters.charAt(Math.floor(Math.random() * characters.length));
	}

	return code;
}

function generateRandomNumber(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function shuffleIndexes(array: any[]) {
	let currentIndex: number = array.length;
	let temporaryValue: number;
	let randomIndex: number;

	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}
