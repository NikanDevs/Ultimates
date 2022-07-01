import {
	GuildEmoji,
	GuildMember,
	User,
	Message,
	ComponentType,
	ButtonStyle,
	ActionRowBuilder,
	ButtonBuilder,
	EmbedBuilder,
} from 'discord.js';
import { capitalize } from '../../functions/other/capitalize';
import { interactions } from '../../interactions';
import { Command } from '../../structures/Command';

export default new Command({
	interaction: interactions.userinfo,
	excute: async ({ client, interaction, options }) => {
		// User
		let member = interaction.options.getMember('user') as GuildMember;
		let user = interaction.options.getUser('user');
		if (!options.getUser('user')) {
			member = interaction.member as GuildMember;
			user = interaction.user as User;
		}

		// Functions
		const UrlTypeCheck = function (avatarURL: string, type: 'Avatar' | 'Banner') {
			switch (type) {
				case 'Avatar':
					if (avatarURL.endsWith('.gif')) {
						return [
							`[WEBP](${user?.displayAvatarURL({
								extension: 'webp',
								size: 1024,
							})})`,
							`[GIF](${user?.displayAvatarURL({
								extension: 'gif',
								size: 1024,
							})})`,
						].join(' • ');
					} else {
						return [
							`[WEBP](${user?.displayAvatarURL({
								extension: 'webp',
								size: 1024,
							})})`,
							`[JPEG](${user?.displayAvatarURL({
								extension: 'jpeg',
								size: 1024,
							})})`,
							`[JPG](${user?.displayAvatarURL({
								extension: 'jpg',
								size: 1024,
							})})`,
							`[PNG](${user?.displayAvatarURL({
								extension: 'png',
								size: 1024,
							})})`,
						].join(' • ');
					}
				// break;
				case 'Banner':
					if (avatarURL.endsWith('.gif')) {
						return [
							`[WEBP](${user?.bannerURL({
								extension: 'webp',
								size: 1024,
							})})`,
							`[GIF](${user?.bannerURL({
								extension: 'gif',
								size: 1024,
							})})`,
						].join(' • ');
					} else {
						return [
							`[WEBP](${user?.bannerURL({
								extension: 'webp',
								size: 1024,
							})})`,
							`[JPEG](${user?.bannerURL({
								extension: 'jpeg',
								size: 1024,
							})})`,
							`[JPG](${user?.bannerURL({
								extension: 'jpg',
								size: 1024,
							})})`,
							`[PNG](${user?.bannerURL({
								extension: 'png',
								size: 1024,
							})})`,
						].join(' • ');
					}
				// break;
			}
		};

		// Fetching users
		await user?.fetch(true);
		await member?.fetch(true);
		const userinfoEmbed = new EmbedBuilder()
			.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
			.setDescription([`**ID:** ${user.id}`, user.toString()].join(' • '))
			.setThumbnail(user.displayAvatarURL())
			.setColor(client.cc.invisible)
			.addFields([
				{
					name: 'Account Information',
					value: [
						`• **ID:** ${user.id}`,
						`• **Username:** ${user.username}`,
						`• **Discriminator:** #${user.discriminator}`,
						`• **Registered:** <t:${~~(+user.createdAt / 1000)}:f> | <t:${~~(
							+user.createdAt / 1000
						)}:R>`,
						`• **Bot:** ${
							user?.bot
								? `${client.config.general.success}`
								: `${client.config.general.error}`
						}`,
					].join('\n'),
				},
				{
					name: 'Avatar',
					value: [
						`• **Animated:** ${
							user.displayAvatarURL().endsWith('.gif')
								? `${client.config.general.success}`
								: `${client.config.general.error}`
						}`,
						`• **Formats:** ${UrlTypeCheck(user.displayAvatarURL(), 'Avatar')}`,
					].join('\n'),
					inline: true,
				},
			]);

		// User's banner
		if (user.bannerURL()) {
			userinfoEmbed.setImage(user.bannerURL({ size: 1024 })).addFields([
				{
					name: 'Banner',
					value: [
						`• **Animated:** ${
							user.bannerURL().endsWith('.gif')
								? `${client.config.general.success}`
								: `${client.config.general.error}`
						}`,
						`• **Formats:** ${UrlTypeCheck(user.bannerURL(), 'Banner')}`,
					].join('\n'),
					inline: true,
				},
			]);
		}

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
			'VerifiedDeveloper' = 'Early Verified Bot Developer',
			'CertifiedModerator' = 'Discord Certified Moderator',
			'BotHTTPInteractions' = 'Http Interaction Bot',
			'Spammer' = 'Most Likely A Spammer',
		}

		const badgesArray = [];
		user.flags?.toArray().forEach((badge) => {
			const badgeEmojiGuild = client.guilds.cache.get('952173308470771712');
			const findBadgeEmoji = badgeEmojiGuild.emojis.cache.find(
				(emoji) => emoji.name === badge
			) as GuildEmoji;
			badgesArray.push(`${findBadgeEmoji} • ${badgesReweite[badge]}`);
		});

		if (badgesArray.length !== 0) {
			userinfoEmbed.addFields([
				{
					name: `Badges [${badgesArray.length}]`,
					value: badgesArray.join('\n'),
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
						name: `Presence`,
						value: [
							`• **Status:** ${capitalize(member?.presence?.status)}`,
							`• **Devices [${
								Object.entries(devices).length
							}]:** ${Object.entries(devices)
								.map(
									(value) =>
										`${value[0][0].toUpperCase()}${value[0].slice(1)}`
								)
								.join(', ')}`,
						].join('\n'),
					},
				]);
			}

			// Button Components
			interface buttonComponentsOptions {
				disableAccount?: boolean;
				disableGuild?: boolean;
				disableRoles?: boolean;
				disablePermissions?: boolean;
			}
			const buttonComponents = (options: buttonComponentsOptions) => [
				new ActionRowBuilder<ButtonBuilder>().addComponents([
					new ButtonBuilder()
						.setLabel('Account')
						.setStyle(ButtonStyle['Primary'])
						.setDisabled(options.disableAccount || false)
						.setCustomId('1'),

					new ButtonBuilder()
						.setLabel('Guild')
						.setStyle(ButtonStyle['Primary'])
						.setDisabled(options.disableGuild || false)
						.setCustomId('2'),

					new ButtonBuilder()
						.setLabel('Roles')
						.setStyle(ButtonStyle['Primary'])
						.setDisabled(options.disableRoles || false)
						.setCustomId('3'),
				]),
			];

			const sentInteraction = (await interaction.reply({
				embeds: [userinfoEmbed],
				components: buttonComponents({ disableAccount: true }),
				fetchReply: true,
			})) as Message;

			const userinfoCollector = sentInteraction.createMessageComponentCollector({
				time: 30000,
				componentType: ComponentType.Button,
			});

			// Whenever the collector is triggered
			userinfoCollector.on('collect', async (collected): Promise<any> => {
				if (collected.user.id !== interaction.user.id)
					return collected.reply({
						content: 'You can not use this.',
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
						let acknowments = 'None';
						if (
							member.permissions.has('BanMembers') ||
							member.permissions.has('ManageMessages') ||
							member.permissions.has('KickMembers') ||
							member.permissions.has('ManageRoles')
						) {
							acknowments = 'Moderator';
						}
						if (member.permissions.has('ManageEvents')) {
							acknowments = 'Event Manager';
						}
						if (member.permissions.has('ManageGuild')) {
							acknowments = 'Server Manager';
						}
						if (member.permissions.has('Administrator')) {
							acknowments = 'Administrator';
						}
						if (user?.id === interaction.guild.ownerId) {
							acknowments = 'Server Owner';
						}

						const userinfoGuildEmbed = new EmbedBuilder()
							.setAuthor({
								name: user.tag,
								iconURL: user.displayAvatarURL(),
							})
							.setDescription(
								[`**ID:** ${user.id}`, user.toString()].join(' • ')
							)
							.setThumbnail(user.displayAvatarURL())
							.setColor(client.cc.invisible)
							.addFields([
								{
									name: `Information in ${interaction.guild.name}`,
									value: [
										`• ** Joined:** <t:${~~(
											+member.joinedAt / 1000
										)}:f> [<t:${~~(+member.joinedAt / 1000)}:R>]`,
										`• **Nickname:** ${
											member.displayName === member.user?.username
												? 'No Nickname'
												: `${member.displayName}`
										}`,
										`• **Booster:** ${
											member.premiumSinceTimestamp
												? `${client.config.general.success}`
												: `${client.config.general.error}`
										}`,
										`• **Boosting Since:** ${
											member.premiumSinceTimestamp
												? `<t:${~~(
														member.premiumSinceTimestamp /
														1000
												  )}:f> | <t:${~~(
														member.premiumSinceTimestamp /
														1000
												  )}:R>`
												: 'Not boosting the server!'
										}`,
										`• **Acknowments:** ${acknowments}`,
									].join('\n'),
								},
							]);

						if (member.avatarURL())
							userinfoGuildEmbed.addFields([
								{
									name: 'Server Avatar',
									value: [
										`• **Animated:** ${
											member.avatarURL().endsWith('.gif')
												? `${client.config.general.success}`
												: `${client.config.general.error}`
										}`,
										`• **Formats:** ${UrlTypeCheck(
											member.avatarURL(),
											'Avatar'
										)}`,
									].join('\n'),
								},
							]);

						interaction.editReply({
							embeds: [userinfoGuildEmbed],
							components: buttonComponents({ disableGuild: true }),
						});
						await collected.deferUpdate();
						break;

					case '3':
						const mappedRoles = member.roles.cache
							.sort((a, b) => b.position - a.position)
							.filter((r) => r.id !== interaction.guildId);
						const userinfoRolesEmbed = new EmbedBuilder()
							.setAuthor({
								name: user.tag,
								iconURL: user.displayAvatarURL(),
							})
							.setThumbnail(user.displayAvatarURL())
							.setColor(client.cc.invisible)
							.setDescription(
								[
									`${user} • ID: ${user?.id}\n`,
									`**Roles [${mappedRoles.size}]**`,
									`${
										mappedRoles.size
											? mappedRoles.map((role) => role).join(' ')
											: 'No roles'
									}`,
								].join('\n')
							);

						interaction.editReply({
							embeds: [userinfoRolesEmbed],
							components: buttonComponents({ disableRoles: true }),
						});
						await collected.deferUpdate();
						break;
				}
			});

			// Whenever the collector times out
			userinfoCollector.on('end', () => {
				interaction.editReply({ components: [] });
			});
		}
	},
});
