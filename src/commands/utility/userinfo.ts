import {
	GuildMember,
	User,
	Message,
	ComponentType,
	ButtonStyle,
	ActionRowBuilder,
	ButtonBuilder,
	EmbedBuilder,
} from 'discord.js';
import { t } from 'i18next';
import { capitalize } from '../../functions/other/capitalize';
import { interactions } from '../../interactions';
import { Command } from '../../structures/Command';
import { userinfoButtonsOptions } from '../../typings';

export default new Command({
	interaction: interactions.userinfo,
	excute: async ({ client, interaction, options }) => {
		let member = interaction.options.getMember('user') as GuildMember;
		let user = interaction.options.getUser('user');
		if (!options.getUser('user')) {
			member = interaction.member as GuildMember;
			user = interaction.user as User;
		}

		await user?.fetch(true);
		await member?.fetch(true);

		const userinfoEmbed = new EmbedBuilder()
			.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
			.setDescription([`**ID:** ${user.id}`, user.toString()].join(' • '))
			.setThumbnail(user.displayAvatarURL())
			.setColor(client.cc.invisible)
			.addFields([
				{
					name: t('command.utility.userinfo.account.info'),
					value: [
						`• **${t('command.utility.userinfo.id')}:** ${user.id}`,
						`• **${t('command.utility.userinfo.account.username')}:** ${user.username}`,
						`• **${t('command.utility.userinfo.account.discrim')}:** #${user.discriminator}`,
						`• **${t('command.utility.userinfo.account.register')}:** <t:${~~(
							+user.createdAt / 1000
						)}:f> | <t:${~~(+user.createdAt / 1000)}:R>`,
						`• **${t('command.utility.userinfo.account.bot')}:** ${
							user?.bot ? `${client.cc.success}` : `${client.cc.error}`
						}`,
					].join('\n'),
				},
			]);

		// User's Badges
		enum badgesReweite {
			'Staff' = 'Discord Employee',
			'Partner' = 'Partnered Server Owner',
			'Hypesquad' = 'HypeSquad Events Coordinator',
			'BugHunterLevel1' = 'Bug Hunter Level 1',
			'BugHunterLevel2' = 'Bug Hunter Level 2',
			'HypeSquadOnlineHouse1' = 'House Bravery Member',
			'HypeSquadOnlineHouse2' = 'House Brilliance Member',
			'HypeSquadOnlineHouse3' = 'House Balance Member',
			'PremiumEarlySupporter' = 'Early Nitro Supporter',
			'TeamPseudoUser' = 'Team User',
			'VerifiedBot' = 'Verified Bot',
			'UnverifiedBot' = 'Unverified Bot',
			'VerifiedDeveloper' = 'Early Verified Bot Developer',
			'CertifiedModerator' = 'Discord Certified Moderator',
			'BotHTTPInteractions' = 'Http Interaction Bot',
			'Spammer' = 'Most Likely A Spammer',
		}

		const badgesArray: string[] = [];
		if (user.bot && !user.flags?.toArray().includes('VerifiedBot')) badgesArray.push('UnverifiedBot');
		user.flags?.toArray().forEach((badge) => badgesArray.push(badge));

		if (badgesArray.length) {
			userinfoEmbed.addFields([
				{
					name: `${t('command.utility.userinfo.account.badges')} [${badgesArray.length}]`,
					value: badgesArray.map((b) => `• ${badgesReweite[b]}`).join('\n'),
				},
			]);
		}

		if (!member) {
			interaction.reply({ embeds: [userinfoEmbed] });
		} else if (member) {
			if (member.presence && ['dnd', 'online', 'idle'].includes(member.presence?.status)) {
				const devices = member.presence?.clientStatus || {};
				userinfoEmbed.addFields([
					{
						name: t('command.utility.userinfo.account.presence'),
						value: [
							`• **${t('command.utility.userinfo.account.status')}:** ${capitalize(
								member?.presence?.status
							)}`,
							`• **${t('command.utility.userinfo.account.devices')} [${
								Object.entries(devices).length
							}]:** ${Object.entries(devices)
								.map((value) => `${value[0][0].toUpperCase()}${value[0].slice(1)}`)
								.join(', ')}`,
						].join('\n'),
					},
				]);
			}

			if (user.avatar) {
				userinfoEmbed.addFields([
					{
						name: t('command.utility.userinfo.account.avatar'),
						value: [
							`• **${t('command.utility.userinfo.animated')}:** ${
								user.displayAvatarURL().endsWith('.gif')
									? `${client.cc.success}`
									: `${client.cc.error}`
							}`,
							`• **${t('command.utility.userinfo.link')}:** [${t(
								'command.utility.userinfo.download'
							)}](${user.displayAvatarURL({
								size: 1024,
							})})`,
						].join('\n'),
						inline: true,
					},
				]);
			}
			if (user.banner) {
				userinfoEmbed.setImage(user.bannerURL({ size: 1024 })).addFields([
					{
						name: t('command.utility.userinfo.account.banner'),
						value: [
							`• **${t('command.utility.userinfo.animated')}:** ${
								user.bannerURL().endsWith('.gif')
									? `${client.cc.success}`
									: `${client.cc.error}`
							}`,
							`• **${t('command.utility.userinfo.link')}:** [${t(
								'command.utility.userinfo.download'
							)}](${user.bannerURL({
								size: 1024,
							})})`,
						].join('\n'),
						inline: true,
					},
				]);
			}

			// Button Components
			const buttonComponents = (options: userinfoButtonsOptions) => [
				new ActionRowBuilder<ButtonBuilder>().addComponents([
					new ButtonBuilder()
						.setLabel(t('command.utility.userinfo.account.account'))
						.setStyle(ButtonStyle.Primary)
						.setDisabled(options.disableAccount || false)
						.setCustomId('1'),

					new ButtonBuilder()
						.setLabel(t('command.utility.userinfo.guild.guild'))
						.setStyle(ButtonStyle.Primary)
						.setDisabled(options.disableGuild || false)
						.setCustomId('2'),
				]),
			];

			const sentInteraction = (await interaction.reply({
				embeds: [userinfoEmbed],
				components: buttonComponents({ disableAccount: true }),
				fetchReply: true,
			})) as Message;

			const userinfoCollector = sentInteraction.createMessageComponentCollector({
				time: 60000,
				componentType: ComponentType.Button,
			});

			userinfoCollector.on('collect', async (collected): Promise<any> => {
				if (collected.user.id !== interaction.user.id)
					return collected.reply({
						content: t('common.errors.cannotInteract'),
						ephemeral: true,
					});

				switch (collected.customId) {
					case '1':
						interaction.editReply({
							embeds: [userinfoEmbed],
							components: buttonComponents({ disableAccount: true }),
						});
						await collected.deferUpdate();
						break;
					case '2':
						let acknowments = t('command.utility.configure.none');
						if (
							member.permissions.has('BanMembers') ||
							member.permissions.has('ManageMessages') ||
							member.permissions.has('KickMembers') ||
							member.permissions.has('ManageRoles')
						) {
							acknowments = t('command.utility.userinfo.guild.roles', { context: 'mod' });
						}
						if (member.permissions.has('ManageEvents')) {
							acknowments = t('command.utility.userinfo.guild.roles', { context: 'events' });
						}
						if (member.permissions.has('ManageGuild')) {
							acknowments = t('command.utility.userinfo.guild.roles', { context: 'manager' });
						}
						if (member.permissions.has('Administrator')) {
							acknowments = t('command.utility.userinfo.guild.roles', { context: 'admin' });
						}
						if (user?.id === interaction.guild.ownerId) {
							acknowments = t('command.utility.userinfo.guild.roles', { context: 'owner' });
						}

						const userinfoGuildEmbed = new EmbedBuilder()
							.setAuthor({
								name: user.tag,
								iconURL: member.avatar ? member.avatarURL() : user.avatarURL(),
							})
							.setDescription(
								[`**${t('command.utility.userinfo.id')}:** ${user.id}`, user.toString()].join(
									' • '
								)
							)
							.setThumbnail(member.avatar ? member.avatarURL() : user.avatarURL())
							.setColor(client.cc.invisible)
							.addFields([
								{
									name: t('command.utility.userinfo.guild.info', {
										guild: interaction.guild.name,
									}),
									value: [
										`• **${t('command.utility.userinfo.guild.joined')}:** <t:${~~(
											+member.joinedAt / 1000
										)}:f> [<t:${~~(+member.joinedAt / 1000)}:R>]`,
										`• **${t('command.utility.userinfo.guild.nickname')}:** ${
											member.displayName === member.user?.username
												? 'No Nickname'
												: `${member.displayName}`
										}`,
										`• **${t('command.utility.userinfo.guild.boosting')}:** ${
											member.premiumSinceTimestamp
												? `<t:${~~(
														member.premiumSinceTimestamp / 1000
												  )}:f> | <t:${~~(member.premiumSinceTimestamp / 1000)}:R>`
												: client.cc.error
										}`,
										`• **${t(
											'command.utility.userinfo.guild.acknowments'
										)}:** ${acknowments}`,
									].join('\n'),
								},
							]);

						if (member.avatarURL())
							userinfoGuildEmbed.addFields([
								{
									name: t('command.utility.userinfo.account.avatar'),
									value: [
										`• **${t('command.utility.userinfo.animated')}:** ${
											member.avatarURL().endsWith('.gif')
												? `${client.cc.success}`
												: `${client.cc.error}`
										}`,
										`• **${t('command.utility.userinfo.link')}:** [${t(
											'command.utility.userinfo.download'
										)}](${member.avatarURL({
											size: 1024,
										})})`,
									].join('\n'),
								},
							]);

						interaction.editReply({
							embeds: [userinfoGuildEmbed],
							components: buttonComponents({ disableGuild: true }),
						});
						await collected.deferUpdate();
						break;
				}
			});

			userinfoCollector.on('end', () => {
				interaction.editReply({ components: [] });
			});
		}
	},
});
