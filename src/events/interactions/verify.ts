import {
	ButtonInteraction,
	ButtonStyle,
	ComponentType,
	GuildMember,
	Message,
	TextInputStyle,
} from 'discord.js';
import { client } from '../..';
import { verificationCollection } from '../../constants';
import { Event } from '../../structures/Event';
import { guild as guildConfig } from '../../json/config.json';
import { convertTime } from '../../functions/convertTime';
const characters = '0123456789';
let key1 = '';

export default new Event('interactionCreate', async (interaction) => {
	// --- Modal answers
	if (interaction.isModalSubmit()) {
		if (interaction.customId !== 'verify-' + interaction.user.id) return;
		const getField = interaction.fields.getField('verify-' + interaction.user.id);
		if (!getField) return;
		const getValue = getField?.value;

		if (getValue.toString() === verificationCollection.get('modal-' + interaction.user.id)) {
			const verifedEmbed = client.util
				.embed()
				.setColor(client.cc.successC)
				.setDescription('Congrats! You were verified in the server.');

			(interaction.member as GuildMember).roles.add(guildConfig.memberRoleId);

			interaction.reply({ embeds: [verifedEmbed], ephemeral: true });
			verificationCollection.delete('cooldown-' + interaction.user.id);
			verificationCollection.delete('modal-' + interaction.user.id);
		} else if (
			getValue.toString() !== verificationCollection.get('modal-' + interaction.user.id)
		) {
			const deniedEmbed = client.util
				.embed()
				.setColor(client.cc.errorC)
				.setDescription(
					"Whoops, your answer wasn't correct. Try again to get verified."
				);

			interaction.reply({ embeds: [deniedEmbed], ephemeral: true });
		}
		verificationCollection.delete('modal-' + interaction.user.id);
	}

	// Verify Button
	if (!interaction.isButton()) return;
	if ((interaction as ButtonInteraction).customId !== 'verify') return;
	if (!interaction.guild.roles.cache.get(guildConfig.memberRoleId))
		return interaction.reply({
			content: "Member role wasn't found, please contact a staff member!",
			ephemeral: true,
		});
	if ((interaction.member as GuildMember).roles.cache.has(guildConfig.memberRoleId))
		return interaction.reply({
			content: "You're already verified into the server!",
			ephemeral: true,
		});

	// Verificaton Cooldown
	const cooldownRemaining = `${~~(
		+verificationCollection.get('cooldown-' + interaction.user.id) - Date.now()
	)}`;
	if (verificationCollection.has('cooldown-' + interaction.user.id))
		return interaction.reply({
			embeds: [
				client.util
					.embed()
					.setDescription(
						`Please wait **${convertTime(
							~~+cooldownRemaining
						)}** before trying to verify again.`
					)
					.setColor(client.cc.attentionC),
			],
			ephemeral: true,
		});

	verificationCollection.set('cooldown-' + interaction.user.id, Date.now() + 20000);
	setTimeout(() => {
		verificationCollection.delete('cooldown-' + interaction.user.id);
	}, 20000);

	const verifiactionMode = ~~(Math.random() * (10 - 1 + 1) + 1);

	// Making random verification keys
	function generateKey1() {
		let code = '';
		for (var i = 0; i < 5; i++) {
			code += characters.charAt(Math.floor(Math.random() * characters.length));
		}
		key1 = code;
	}
	if (verifiactionMode > 5) {
		await interaction.deferReply({ ephemeral: true });
		let key2 = '';

		function generateKey2() {
			const randomNumber = ~~(Math.random() * (10 - 1 + 1) + 1);

			if (randomNumber > 5) {
				key2 = key1;
			} else if (randomNumber <= 5) {
				let code = '';
				for (var i = 0; i < 5; i++) {
					code += characters.charAt(Math.floor(Math.random() * characters.length));
				}
				key2 = code;
			}
		}

		// Calling out the functions
		generateKey1();
		generateKey2();

		// Embeds and components
		const embed = client.util
			.embed()
			.setAuthor({
				name: 'Are these keys matching each other?',
			})
			.setDescription(
				'Check if the 2 keys below are **exactly** the same as each other. Submit your answer by clicking the buttons!'
			)
			.addFields(
				{
					name: 'Key #1',
					value: key1,
					inline: true,
				},
				{
					name: 'Key #2',
					value: key2,
					inline: true,
				}
			)
			.setColor(client.cc.invisible);

		const buttonComponent = client.util
			.actionRow()
			.addComponents(
				client.util
					.button()
					.setCustomId('verify-1')
					.setLabel('Matching')
					.setStyle(ButtonStyle['Success']),
				client.util
					.button()
					.setCustomId('verify-2')
					.setLabel('Not Matching')
					.setStyle(ButtonStyle['Danger'])
			);

		const msg = (await interaction.followUp({
			embeds: [embed],
			components: [buttonComponent],
		})) as Message;

		// Collecting the answer
		const collector = msg.createMessageComponentCollector({
			time: 30000,
			componentType: ComponentType['Button'],
			max: 1,
		});

		collector.on('collect', (collected) => {
			if (interaction.user.id !== collected.user.id) return;
			var areMatching: boolean = key1 === key2;
			collector.stop('success');

			if (
				(areMatching && collected.customId === 'verify-1') ||
				(!areMatching && collected.customId === 'verify-2')
			) {
				const verifedEmbed = client.util
					.embed()
					.setColor(client.cc.successC)
					.setDescription('Congrats! You were verified in the server.');

				if (!interaction.guild.roles.cache.get(guildConfig.memberRoleId)) return;
				(interaction.member as GuildMember).roles.add(guildConfig.memberRoleId);
				interaction.editReply({ embeds: [verifedEmbed], components: [] });
			} else {
				const deniedEmbed = client.util
					.embed()
					.setColor(client.cc.errorC)
					.setDescription(
						"Whoops, your answer wasn't correct. Try again to get verified."
					);

				interaction.editReply({ embeds: [deniedEmbed], components: [] });
			}
		});

		collector.on('end', (_, reason) => {
			if (reason === 'success') return;

			const timedOut = client.util
				.embed()
				.setColor(client.cc.errorC)
				.setDescription('Verification timed out, try again to verify yourself.');

			interaction.editReply({ embeds: [timedOut], components: [] });
		});
	} else if (verifiactionMode <= 5) {
		generateKey1();

		const modal = client.util
			.modal()
			.setTitle('Verification | Code: ' + key1)
			.setCustomId('verify-' + interaction.user.id)
			.addComponents({
				type: ComponentType['ActionRow'],
				components: [
					{
						type: ComponentType['TextInput'],
						custom_id: 'verify-' + interaction.user.id,
						label: 'Your Code: ' + key1,
						style: TextInputStyle['Short'],
						required: true,
						max_length: 5,
						min_length: 5,
						placeholder: `Enter your verification code...`,
					},
				],
			});

		await interaction.showModal(modal);
		verificationCollection.set('modal-' + interaction.user.id, key1);
	}
});
