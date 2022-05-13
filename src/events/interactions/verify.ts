import {
	ButtonInteraction,
	ButtonStyle,
	Colors,
	ComponentType,
	GuildMember,
	Message,
	TextInputStyle,
} from 'discord.js';
import { client } from '../..';
import { verificationCollection } from '../../constants';
import { Event } from '../../structures/Event';
const memberRoleId = client.config.memberRoleId;
const characters = '0123456789';
let firstCode = '';

export default new Event('interactionCreate', async (interaction) => {
	// --- Modal answers
	if (interaction.isModalSubmit()) {
		const getField = interaction.fields.getField('verify-' + interaction.user.id);
		if (!getField) return;
		const getValue = getField?.value;

		if (getValue.toString() === verificationCollection.get('modal-' + interaction.user.id)) {
			const verifedEmbed = client.util
				.embed()
				.setAuthor({
					name: interaction.guild.name,
					iconURL: interaction.guild.iconURL(),
				})
				.setTitle('Verification Succeeded')
				.setColor(client.colors.success)
				.setDescription(
					`Congrats, You entered your verification code correct, you were verified into the server.`
				);

			(interaction.member as GuildMember).roles.add(memberRoleId);

			interaction.reply({ embeds: [verifedEmbed], ephemeral: true });
			verificationCollection.delete('cooldown-' + interaction.user.id);
			verificationCollection.delete('modal-' + interaction.user.id);
		} else if (
			getValue.toString() !== verificationCollection.get('modal-' + interaction.user.id)
		) {
			const deniedEmbed = client.util
				.embed()
				.setAuthor({
					name: interaction.guild.name,
					iconURL: interaction.guild.iconURL(),
				})
				.setTitle('Verification Denied')
				.setColor(client.colors.error)
				.setDescription(
					`Sadly, you didn't enter the correct code in the field, try again to get verified.`
				);

			interaction.reply({ embeds: [deniedEmbed], ephemeral: true });
		}
		verificationCollection.delete('modal-' + interaction.user.id);
	}

	// Verify Button
	if (!interaction.isButton()) return;
	if ((interaction as ButtonInteraction).customId !== 'verify') return;
	if (!interaction.guild.roles.cache.get(memberRoleId))
		return interaction.reply({
			content: "Member role wasn't found, please contact a staff member!",
			ephemeral: true,
		});
	if ((interaction.member as GuildMember).roles.cache.has(memberRoleId))
		return interaction.reply({
			content: "You're already verified into the server!",
			ephemeral: true,
		});

	// Verificaton Cooldown
	const cooldownRemaining = `${~~(
		+verificationCollection.get('cooldown-' + interaction.user.id) - +Date.now()
	)}`;
	if (verificationCollection.has('cooldown-' + interaction.user.id))
		return interaction.reply({
			content: `Please wait for **${client.util.convertTime(
				~~(+cooldownRemaining / 1000)
			)}** before trying to verify again.`,
			ephemeral: true,
		});

	verificationCollection.set('cooldown-' + interaction.user.id, Date.now() + 60000);
	setTimeout(() => {
		verificationCollection.delete(interaction.user.id);
	}, 60000);

	const verifiactionMode = ~~(Math.random() * (10 - 1 + 1) + 1);

	// Making the random verification code
	function generateLetter1() {
		let code = '';
		for (var i = 0; i < 5; i++) {
			code += characters.charAt(Math.floor(Math.random() * characters.length));
		}
		firstCode = code;
	}

	if (verifiactionMode > 5) {
		await interaction.deferReply({ ephemeral: true });
		let secondCode = '';

		function generateLetter2() {
			const randomNumber = ~~(Math.random() * (10 - 1 + 1) + 1);

			if (randomNumber > 5) {
				secondCode = firstCode;
			} else if (randomNumber <= 5) {
				let code = '';
				for (var i = 0; i < 5; i++) {
					code += characters.charAt(Math.floor(Math.random() * characters.length));
				}
				secondCode = code;
			}
		}

		// Calling out the functions
		generateLetter1();
		generateLetter2();

		// Embeds and components
		const embed = client.util
			.embed()
			.setAuthor({
				name: interaction.guild.name,
				iconURL: interaction.guild.iconURL(),
			})
			.setTitle('Are these letters matching each other?')
			.setDescription(
				'You need to check if the 2 letters/codes below are **exactly** the same as each other. You need to provide the capital letters too.'
			)
			.addFields(
				{
					name: 'Letter #1',
					value: firstCode,
					inline: true,
				},
				{
					name: 'Letter #2',
					value: secondCode,
					inline: true,
				}
			)
			.setColor(client.colors.ultimates);

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
			var isMatching: boolean = firstCode === secondCode;
			collector.stop('success');

			if (
				(isMatching && collected.customId === 'verify-1') ||
				(!isMatching && collected.customId === 'verify-2')
			) {
				const verifedEmbed = client.util
					.embed()
					.setAuthor({
						name: interaction.guild.name,
						iconURL: interaction.guild.iconURL(),
					})
					.setTitle('Verification Succeeded')
					.setColor(client.colors.success)
					.setDescription(
						`Congrats, \`${firstCode}\` and \`${secondCode}\` ${matchingBoolean()}. You were verified into the server!`
					);

				if (!interaction.guild.roles.cache.get(memberRoleId)) return;
				(interaction.member as GuildMember).roles.add(memberRoleId);
				interaction.editReply({ embeds: [verifedEmbed], components: [] });

				verificationCollection.delete('cooldown-' + interaction.user.id);
			} else {
				const deniedEmbed = client.util
					.embed()
					.setAuthor({
						name: interaction.guild.name,
						iconURL: interaction.guild.iconURL(),
					})
					.setTitle('Verification Denied')
					.setColor(client.colors.error)
					.setDescription(
						`Sadly, \`${firstCode}\` and \`${secondCode}\` ${matchingBoolean()}, and... you chose the wrong answer, try again to get verifed.`
					);

				interaction.editReply({ embeds: [deniedEmbed], components: [] });
			}

			function matchingBoolean() {
				if (isMatching) {
					return 'were matching each other';
				} else if (!isMatching) {
					return 'were not matching each other';
				}
			}
		});

		collector.on('end', (_, reason) => {
			if (reason === 'success') return;

			const timedOut = client.util
				.embed()
				.setAuthor({
					name: interaction.guild.name,
					iconURL: interaction.guild.iconURL(),
				})
				.setTitle('Verification Timed Out')
				.setColor(Colors['Red'])
				.setDescription(
					"The verifiaction timed out most likely because you didn't answer in time, try again to get verifed."
				);

			interaction.editReply({ embeds: [timedOut], components: [] });
		});
	} else if (verifiactionMode <= 5) {
		// Calling out the functions
		generateLetter1();

		// Sending the modal
		const modal = client.util
			.modal()
			.setTitle('Verification | Code: ' + firstCode)
			.setCustomId('verify-' + interaction.user.id)
			.addComponents({
				type: ComponentType['ActionRow'],
				components: [
					{
						type: ComponentType['TextInput'],
						custom_id: 'verify-' + interaction.user.id,
						label: 'Your Code: ' + firstCode,
						style: TextInputStyle['Short'],
						required: true,
						max_length: 5,
						min_length: 5,
						placeholder: `Enter your verification code...`,
					},
				],
			});

		await interaction.showModal(modal);
		verificationCollection.set('modal-' + interaction.user.id, firstCode);
	}
});
